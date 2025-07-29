import { VerificationType } from '@prisma/client';
import { config } from '../../config/app.config';
import { ErrorCode } from '../../cummon/enums/error-code.enum';
import {
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  UpdatePasswordDto,
  UpdateProfileDto,
} from '../../cummon/interface/auth.interface';
import { encryptValue } from '../../cummon/utils/bcrypt';
import {
  BadRequestException,
  HttpException,
  InternalServerException,
  NotFoundException,
  UnauthorizedException,
} from '../../cummon/utils/catch-errors';
import { generateUniqueCode } from '../../cummon/utils/uuid';

import { db } from '../../database/database';
import { sendEmail } from '../../mailers/mailer';
import {
  passwordResetTemplate,
  verifyEmailTemplate,
} from '../../mailers/templates/template';
import {
  anHourFromNow,
  calculateExpirationDate,
  fortyFiveMinutesFromNow,
  ONE_DAY_IN_MS,
  thirtyDaysFromNow,
  threeMinutesAgo,
} from '../../cummon/utils/date-time';
import {
  refreshTokenSignOptions,
  RefreshTPayload,
  signJwtToken,
  verifyJwtToken,
} from '../../cummon/utils/jwt';
import { VerificationEnum } from '../../cummon/enums/verification-code.enum';
import { HTTPSTATUS } from '../../config/http.config';

export class AuthService {
  public async register(registerData: RegisterDto) {
    const { fullname, username, email, password } = registerData;
    const existingUser = await db.user.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        'User already exists with this email',
        ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
      );
    }
    if (username) {
      const existingUsername = await db.user.findFirst({
        where: {
          username,
        },
      });

      if (existingUsername) {
        throw new BadRequestException(
          'Username already exists',
          ErrorCode.AUTH_USERNAME_ALREADY_EXISTS,
        );
      }
    }
    const newUser = await db.user.create({
      data: {
        fullname,
        username,
        email,
        password: await encryptValue(password),
      },
    });

    const userId = newUser.id;

    const verification = await db.verificationCode.create({
      data: {
        userId,
        code: generateUniqueCode(),
        type: VerificationType.EMAIL_VERIFICATION,
        expiresAt: fortyFiveMinutesFromNow(),
      },
    });

    // send email
    const verificationUrl = `${config.APP_ORIGIN}/auth/confirm-account?code=${verification.code}`;
    await sendEmail({
      to: newUser.email,
      ...verifyEmailTemplate(verificationUrl),
    });

    await db.userPreferences.create({
      data: {
        userId,
        enable2FA: false,
        emailNotification: true,
      },
    });

    const showNewUser = await db.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        userPreferences: true,
      },
    });

    return {
      user: showNewUser,
    };
  }

  public async login(loginData: LoginDto) {
    //   public async register(register: RegisterDto) {
    const { identifier, password, userAgent } = loginData;

    const user = await db.user.findFirst({
      where: {
        OR: [
          {
            username: identifier,
          },
          {
            email: identifier,
          },
        ],
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        userPreferences: true,
        password: true, // Include password for validation
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Invalid email provided',
        ErrorCode.AUTH_USER_NOT_FOUND,
      );
    }

    const isPasswordValid = (await encryptValue(password)) === user.password;

    if (!isPasswordValid) {
      throw new BadRequestException(
        'Invalid password provided',
        ErrorCode.AUTH_USER_NOT_FOUND,
      );
    }

    if (user.userPreferences?.enable2FA) {
      return {
        user: null,
        mfaRequired: true,
        refreshToken: '',
        accessToken: '',
      };
    }

    const session = await db.session.create({
      data: {
        userId: user.id,
        userAgent: userAgent ?? null,
        expiredAt: thirtyDaysFromNow(),
      },
    });

    const accessToken = signJwtToken({
      userId: user.id,
      sessionId: session.id,
    });

    const refreshToken = signJwtToken(
      {
        sessionId: session.id,
      },
      refreshTokenSignOptions,
    );

    const showUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        userPreferences: true,
        role: true,
      },
    });

    return {
      user: showUser,
      accessToken,
      refreshToken,
      mfaRequired: false,
    };
  }

  public async refreshToken(refreshTokenData: string) {
    const { payload } = verifyJwtToken<RefreshTPayload>(refreshTokenData, {
      secret: refreshTokenSignOptions.secret,
    });

    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await db.session.findFirst({
      where: {
        id: payload.sessionId,
      },
    });

    const now = Date.now();

    if (!session) {
      throw new UnauthorizedException('Session does not exist');
    }

    if (session.expiredAt.getTime() <= now) {
      throw new UnauthorizedException('Session expired');
    }

    const sessionRequireRefresh =
      session.expiredAt.getTime() - now <= ONE_DAY_IN_MS;

    if (sessionRequireRefresh) {
      await db.session.update({
        where: {
          id: session.id,
        },
        data: {
          expiredAt: calculateExpirationDate(config.JWT.REFRESH_EXPIRES_IN),
        },
      });
    }

    const newRefreshToken = sessionRequireRefresh
      ? signJwtToken({ sessionId: session.id }, refreshTokenSignOptions)
      : undefined;

    const accessToken = signJwtToken({
      userId: session.userId,
      sessionId: session.id,
    });

    return {
      accessToken,
      newRefreshToken,
    };
  }

  public async verifyEmail(code: string) {
    // console.log('Received code:', code);

    // Cari berdasarkan code saja dulu
    const validCode = await db.verificationCode.findFirst({
      where: {
        code,
      },
    });

    // const verificationCodes = await db.verificationCode.findMany({});
    // console.log('All verification codes:', verificationCodes);

    if (!validCode) {
      throw new BadRequestException('Kode verifikasi tidak ditemukan');
    }

    if (validCode.type !== VerificationEnum.EMAIL_VERIFICATION) {
      throw new BadRequestException('Tipe kode verifikasi tidak valid');
    }

    // if (validCode.expiresAt <= new Date()) {
    //   throw new BadRequestException('Kode verifikasi telah kedaluwarsa');
    // }

    const updateUser = await db.user.update({
      where: {
        id: validCode.userId,
      },
      data: {
        isEmailVerified: true,
      },
    });

    if (!updateUser) {
      throw new BadRequestException(
        'Unable to verify email address',
        ErrorCode.VERIFICATION_ERROR,
      );
    }

    await db.verificationCode.delete({
      where: {
        id: validCode.id,
      },
    });

    return {
      user: updateUser,
    };
  }

  public async forgotPassword(email: string) {
    const user = await db.user.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // check mail rate limit is 2 emails per 3 or 10 min
    const timeAgo = threeMinutesAgo();
    const maxAttempts = 2;

    const count = await db.verificationCode.count({
      where: {
        userId: user.id,
        type: VerificationEnum.PASSWORD_RESET,
        createdAt: {
          gt: timeAgo,
        },
      },
    });

    if (count >= maxAttempts) {
      throw new HttpException(
        'To many request, try again later',
        HTTPSTATUS.TOO_MANY_REQUESTS,
        ErrorCode.AUTH_TOO_MANY_ATTEMPTS,
      );
    }

    const expiresAt = anHourFromNow();
    const validCode = await db.verificationCode.create({
      data: {
        userId: user.id,
        type: VerificationEnum.PASSWORD_RESET,
        expiresAt,
        code: generateUniqueCode(),
      },
    });

    const resetLink = `${config.APP_ORIGIN}/reset-password?code=${validCode.code}&exp=${expiresAt.getTime()}`;

    const { data, error } = await sendEmail({
      to: user.email,
      ...passwordResetTemplate(resetLink),
    });

    if (!data?.id) {
      throw new InternalServerException(`${error?.name} ${error?.message}`);
    }

    return {
      url: resetLink,
      emailId: data.id,
    };
  }

  public async resetPassword({ password, verificationCode }: ResetPasswordDto) {
    const validCode = await db.verificationCode.findFirst({
      where: {
        code: verificationCode,
        type: VerificationEnum.PASSWORD_RESET,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!validCode) {
      throw new NotFoundException('Invalid or expred verification code');
    }

    const hashPassword = await encryptValue(password);

    const updateUser = await db.user.update({
      where: {
        id: validCode.userId,
      },
      data: {
        password: hashPassword,
      },
    });

    if (!updateUser) {
      throw new BadRequestException('Failed to reset password');
    }

    await db.verificationCode.delete({
      where: {
        id: validCode.id,
      },
    });

    await db.session.deleteMany({
      where: {
        userId: updateUser.id,
      },
    });

    const showUser = await db.user.findFirst({
      where: {
        id: updateUser.id,
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        userPreferences: true,
        sessions: true,
      },
    });

    return {
      user: showUser,
    };
  }

  public async logout(sessionId: string) {
    return await db.session.deleteMany({
      where: {
        id: sessionId,
      },
    });
  }

  public async updateProfile({
    fullname,
    profilePicture,
    userId,
  }: UpdateProfileDto) {
    const oldUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!oldUser) {
      throw new BadRequestException('Failed to update profile');
    }

    if (
      oldUser.fullname === fullname &&
      oldUser.profilePicture === profilePicture
    ) {
      throw new BadRequestException('No changes detected');
    }
    const updateUser = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        fullname,
        profilePicture,
      },
    });

    if (!updateUser) {
      throw new BadRequestException('Failed to update profile');
    }

    await db.userHistoryUpdate.create({
      data: {
        userId: updateUser.id,
        oldFullname: oldUser.fullname,
        oldProfilePicture: oldUser.profilePicture,
        fullname,
        profilePicture,
        message: 'User updated profile',
      },
    });

    const showUser = await db.user.findFirst({
      where: {
        id: updateUser.id,
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        userPreferences: true,
        sessions: true,
      },
    });

    return {
      user: showUser,
    };
  }

  public async updatePassword({
    oldPassword,
    password,
    userId,
  }: UpdatePasswordDto) {
    const user = await db.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        userPreferences: true,
        password: true, // Include password for validation
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Invalid user id provided',
        ErrorCode.AUTH_USER_NOT_FOUND,
      );
    }

    const hashOldPassword = await encryptValue(oldPassword);
    const isPasswordValid = hashOldPassword === user.password;

    if (!isPasswordValid) {
      throw new BadRequestException(
        'Invalid password provided',
        ErrorCode.AUTH_USER_NOT_FOUND,
      );
    }

    const newHashPassword = await encryptValue(password);
    const updateUser = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        password: newHashPassword,
      },
    });

    if (!updateUser) {
      throw new BadRequestException('Failed to update password');
    }

    await db.userHistoryUpdate.create({
      data: {
        userId: updateUser.id,
        message: 'User updated password',
      },
    });

    const showUser = await db.user.findFirst({
      where: {
        id: updateUser.id,
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        userPreferences: true,
        sessions: true,
      },
    });

    return {
      user: showUser,
    };
  }
}
