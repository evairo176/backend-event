"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = exports.setupJwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = __importDefault(require("passport"));
const app_config_1 = require("../../config/app.config");
const database_1 = require("../../database/database");
const catch_errors_1 = require("../utils/catch-errors");
const options = {
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
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: app_config_1.config.JWT.SECRET,
    audience: ['user'],
    algorithms: ['HS256'],
    passReqToCallback: true,
};
const setupJwtStrategy = (passport) => {
    passport.use(new passport_jwt_1.Strategy(options, (req, payload, done) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const session = yield database_1.db.session.findUnique({
                where: {
                    id: payload.sessionId,
                },
            });
            if (!session || session.expiredAt < new Date()) {
                console.log('session have been revoke', +(payload === null || payload === void 0 ? void 0 : payload.sessionId));
                return done(null, false, {
                    name: 'SessionRevoked',
                    message: 'Session has been revoked or expired',
                });
            }
            const user = yield database_1.db.user.findFirst({
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
        }
        catch (error) {
            return done(error, false);
        }
    })));
};
exports.setupJwtStrategy = setupJwtStrategy;
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
        return next(new catch_errors_1.UnauthorizedException('Authorization header is missing', "AUTH_TOKEN_NOT_FOUND" /* ErrorCode.AUTH_TOKEN_NOT_FOUND */));
    }
    const [prefix, token] = authHeader.split(' ');
    if (prefix !== 'Bearer' || !token) {
        return next(new catch_errors_1.UnauthorizedException('Authorization header is malformed', "AUTH_INVALID_TOKEN" /* ErrorCode.AUTH_INVALID_TOKEN */));
    }
    passport_1.default.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err || !user) {
            if ((info === null || info === void 0 ? void 0 : info.name) === 'TokenExpiredError') {
                return next(new catch_errors_1.UnauthorizedException('Access token expired', "AUTH_TOKEN_EXPIRED" /* ErrorCode.AUTH_TOKEN_EXPIRED */));
            }
            if ((info === null || info === void 0 ? void 0 : info.name) === 'JsonWebTokenError') {
                return next(new catch_errors_1.UnauthorizedException('Access token is invalid', "AUTH_INVALID_TOKEN" /* ErrorCode.AUTH_INVALID_TOKEN */));
            }
            if ((info === null || info === void 0 ? void 0 : info.message) === 'No auth token') {
                return next(new catch_errors_1.UnauthorizedException('Access token not found', "AUTH_TOKEN_NOT_FOUND" /* ErrorCode.AUTH_TOKEN_NOT_FOUND */));
            }
            if ((info === null || info === void 0 ? void 0 : info.name) === 'SessionRevoked') {
                return next(new catch_errors_1.UnauthorizedException(info === null || info === void 0 ? void 0 : info.message, "AUTH_SESSION_REVOKED" /* ErrorCode.AUTH_SESSION_REVOKED */));
            }
            // fallback jika info tidak cocok
            return next(new catch_errors_1.UnauthorizedException('Unauthorized access', "AUTH_UNAUTHORIZED" /* ErrorCode.AUTH_UNAUTHORIZED */));
        }
        req.user = user;
        next();
    })(req, res, next);
};
exports.authenticateJWT = authenticateJWT;
