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
}
