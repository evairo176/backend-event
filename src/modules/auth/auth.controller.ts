import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares';
import { AuthService } from './auth.service';
import { HTTPSTATUS } from '../../config/http.config';
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
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
  // test
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
          mfaRequired: result.mfaRequired,
        });
    },
  );

  public refreshToken = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const refreshToken = req.cookies.refreshToken as string | undefined;

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
}
