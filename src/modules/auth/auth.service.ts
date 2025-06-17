import { VerificationType } from '@prisma/client';
import { config } from '../../config/app.config';
import { ErrorCode } from '../../cummon/enums/error-code.enum';
import { LoginDto, RegisterDto } from '../../cummon/interface/auth.interface';
import { encryptValue } from '../../cummon/utils/bcrypt';
import { BadRequestException } from '../../cummon/utils/catch-errors';
import { generateUniqueCode } from '../../cummon/utils/uuid';

import { db } from '../../database/database';
import { sendEmail } from '../../mailers/mailer';
import { verifyEmailTemplate } from '../../mailers/templates/template';
import {
  fortyFiveMinutesFromNow,
  thirtyDaysFromNow,
} from '../../cummon/utils/date-time';
import { refreshTokenSignOptions, signJwtToken } from '../../cummon/utils/jwt';

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
    const verificationUrl = `${config.APP_ORIGIN}/confirm-account?code=${verification.code}`;
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
      },
    });

    return {
      user: showUser,
      accessToken,
      refreshToken,
      mfaRequired: false,
    };
  }
}
