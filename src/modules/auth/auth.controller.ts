import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { HTTPSTATUS } from '../../config/http.config';
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema,
  verificationEmailSchema,
} from '../../cummon/validators/auth.validator';
import {
  clearAuthenticationCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthenticationCookies,
} from '../../cummon/utils/cookies';
import {
  NotFoundException,
  UnauthorizedException,
} from '../../cummon/utils/catch-errors';
import { asyncHandler } from '../../middlewares/async-handler.middleware';
import { db } from '../../database/database';
//test
export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public register = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = registerSchema.parse({
        ...req?.body,
      });

      const result = await this.authService.register(body);
      return res.status(HTTPSTATUS.CREATED).json({
        message: 'User registered successfully',
        data: result.user,
      });
    },
  );

  public login = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const userAgent = req?.headers['user-agent'];
      const body = loginSchema.parse({
        ...req?.body,
        userAgent,
      });

      const result = await this.authService.login(body);

      if (result.mfaRequired) {
        return res.status(HTTPSTATUS.OK).json({
          message: 'Verify MFA authentication',
          mfaRequired: result.mfaRequired,
          user: result.user,
        });
      }

      return setAuthenticationCookies({
        res,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      })
        .status(HTTPSTATUS.OK)
        .json({
          message: 'User login successfully',
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          mfaRequired: result.mfaRequired,
        });
    },
  );
  public me = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const user = req.user;

      const dataUser = await db.user.findFirst({
        where: {
          id: user?.id,
        },
        select: {
          id: true,
          fullname: true,
          username: true,
          email: true,
          role: true,
          profilePicture: true,
          activationCode: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return res.status(HTTPSTATUS.OK).json({
        message: 'get profile successfully',
        data: dataUser,
      });
    },
  );

  public refreshToken = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const refreshToken = req.headers['refresh-token'] as string | undefined;
      // console.log(refreshToken);
      if (!refreshToken) {
        throw new UnauthorizedException('Missing refresh token');
      }

      const { accessToken, newRefreshToken } =
        await this.authService.refreshToken(refreshToken);

      if (newRefreshToken) {
        res.cookie(
          'refreshToken',
          newRefreshToken,
          getRefreshTokenCookieOptions(),
        );
      }

      return res
        .status(HTTPSTATUS.OK)
        .cookie('accessToken', accessToken, getAccessTokenCookieOptions())
        .json({
          message: 'Refresh access token successfully',
          accessToken,
        });
    },
  );

  public verifyEmail = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { code } = verificationEmailSchema.parse({
        ...req?.body,
      });

      await this.authService.verifyEmail(code);
      return res.status(HTTPSTATUS.OK).json({
        message: 'Email verified successfully',
      });
    },
  );
  public forgotPassword = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const email = emailSchema.parse(req?.body.email);

      await this.authService.forgotPassword(email);
      return res.status(HTTPSTATUS.OK).json({
        message: 'Password reset email sent',
      });
    },
  );
  public resetPassword = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = resetPasswordSchema.parse(req?.body);

      await this.authService.resetPassword(body);
      return clearAuthenticationCookies(res).status(HTTPSTATUS.OK).json({
        message: 'Reset password successfully',
      });
    },
  );

  public logout = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const sessionId = req.sessionId;

      if (!sessionId) {
        throw new NotFoundException('Session is invalid');
      }

      await this.authService.logout(sessionId);
      return clearAuthenticationCookies(res).status(HTTPSTATUS.OK).json({
        message: 'User logout successfully',
      });
    },
  );

  public updateProfile = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = updateProfileSchema.parse(req?.body);
      const userId = req.user?.id;

      await this.authService.updateProfile({
        ...body,
        userId: userId as string,
      });
      return res.status(HTTPSTATUS.OK).json({
        message: 'Update profile successfully',
      });
    },
  );

  public updatePassword = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = updatePasswordSchema.parse(req?.body);
      const userId = req.user?.id;
      await this.authService.updatePassword({
        ...body,
        userId: userId as string,
      });
      return res.status(HTTPSTATUS.OK).json({
        message: 'Update password successfully',
      });
    },
  );
}
