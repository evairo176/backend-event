import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptionsWithRequest,
} from 'passport-jwt';
import passport, { PassportStatic } from 'passport';
import { ErrorCode } from '../enums/error-code.enum';
import { config } from '../../config/app.config';
import { db } from '../../database/database';
import { NextFunction, Request, Response } from 'express';
import { UnauthorizedException } from '../utils/catch-errors';

interface JwtPayload {
  userId: string;
  sessionId: string;
}

const options: StrategyOptionsWithRequest = {
  // jwtFromRequest: ExtractJwt.fromExtractors([
  //   (req) => {
  //     const accessToken = req?.cookies?.accessToken;

  //     if (!accessToken) {
  //       throw new UnauthorizedException(
  //         'Unauthorized access token',
  //         ErrorCode.AUTH_TOKEN_NOT_FOUND,
  //       );
  //     }
  //     return accessToken;
  //   },
  // ]),
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.JWT.SECRET,
  audience: ['user'],
  algorithms: ['HS256'],
  passReqToCallback: true,
};

export const setupJwtStrategy = (passport: PassportStatic) => {
  passport.use(
    new JwtStrategy(options, async (req, payload: JwtPayload, done) => {
      try {
        const session = await db.session.findUnique({
          where: {
            id: payload.sessionId,
          },
        });

        if (!session || session.expiredAt < new Date()) {
          console.log('session have been revoke', +payload?.sessionId);
          return done(null, false, {
            name: 'SessionRevoked',
            message: 'Session has been revoked or expired',
          });
        }

        const user = await db.user.findFirst({
          where: {
            id: payload.userId,
          },
          include: {
            userPreferences: true,
          },
        });

        if (!user) {
          return done(null, false);
        }

        req.sessionId = payload.sessionId;
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }),
  );
};

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    return next(
      new UnauthorizedException(
        'Authorization header is missing',
        ErrorCode.AUTH_TOKEN_NOT_FOUND,
      ),
    );
  }

  const [prefix, token] = authHeader.split(' ');

  if (prefix !== 'Bearer' || !token) {
    return next(
      new UnauthorizedException(
        'Authorization header is malformed',
        ErrorCode.AUTH_INVALID_TOKEN,
      ),
    );
  }

  passport.authenticate(
    'jwt',
    { session: false },
    (err: any, user: any, info: any) => {
      if (err || !user) {
        if (info?.name === 'TokenExpiredError') {
          return next(
            new UnauthorizedException(
              'Access token expired',
              ErrorCode.AUTH_TOKEN_EXPIRED,
            ),
          );
        }

        if (info?.name === 'JsonWebTokenError') {
          return next(
            new UnauthorizedException(
              'Access token is invalid',
              ErrorCode.AUTH_INVALID_TOKEN,
            ),
          );
        }

        if (info?.message === 'No auth token') {
          return next(
            new UnauthorizedException(
              'Access token not found',
              ErrorCode.AUTH_TOKEN_NOT_FOUND,
            ),
          );
        }

        if (info?.name === 'SessionRevoked') {
          return next(
            new UnauthorizedException(
              info?.message,
              ErrorCode.AUTH_SESSION_REVOKED,
            ),
          );
        }

        // fallback jika info tidak cocok
        return next(
          new UnauthorizedException(
            'Unauthorized access',
            ErrorCode.AUTH_UNAUTHORIZED,
          ),
        );
      }

      req.user = user;
      next();
    },
  )(req, res, next);
};
