import { UserStatus, VerificationType } from '@prisma/client';
import { ErrorCode } from '../../cummon/enums/error-code.enum';
import {
  IAddUserEvent,
  IPaginationQuery,
  UpdateActivateDto,
} from '../../cummon/interface/user.interface';
import { BadRequestException } from '../../cummon/utils/catch-errors';
import { db } from '../../database/database';
import { encryptValue } from '../../cummon/utils/bcrypt';
import { generateUniqueCode } from '../../cummon/utils/uuid';
import { fortyFiveMinutesFromNow } from '../../cummon/utils/date-time';
import { sendEmail } from '../../mailers/mailer';
import { config } from '../../config/app.config';
import { verifyEmailTemplate } from '../../mailers/templates/template';

export class UserService {
  public async findUserById(userId: string) {
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
      },
    });

    return user || null;
  }

  public async findAll({
    page = 1,
    limit = 10,
    search,
    userId,
  }: IPaginationQuery) {
    const query: any = {
      NOT: {
        id: userId,
      },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    if (search) {
      query.OR = [
        {
          fullname: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where: query,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          fullname: true,
          email: true,
          isEmailVerified: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          userPreferences: true,
          companyId: true,
          company: true,
        },
      }),
      db.user.count({
        where: query,
      }),
    ]);

    return {
      users,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  public async updateActivate({ userId, value }: UpdateActivateDto) {
    if (!userId) {
      throw new BadRequestException(
        'Invalid user id provided',
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
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
        status: true,
        role: true,
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Invalid user id provided',
        ErrorCode.AUTH_USER_NOT_FOUND,
      );
    }

    if (user.status === 'NORMAL') {
      throw new BadRequestException(
        'User is not allowed this action',
        ErrorCode.USER_NOT_ALLOWED,
      );
    }

    if (user.status === 'APPROVE' && value) {
      throw new BadRequestException(
        'User status already approved',
        ErrorCode.USER_STATUS_APPROVED,
      );
    }

    if (user.status === 'REJECT' && !value) {
      throw new BadRequestException(
        'User status already rejected',
        ErrorCode.USER_STATUS_REJECTED,
      );
    }

    const updateUser = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        status: value === true ? 'APPROVE' : 'REJECT',
      },
    });

    if (!updateUser) {
      throw new BadRequestException('Failed to update password');
    }

    await db.userHistoryUpdate.create({
      data: {
        userId: updateUser.id,
        message: `update status ${UserStatus.APPROVE}`,
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
        status: true,
        role: true,
        company: true,
      },
    });

    return {
      user: showUser,
      status: showUser?.status,
    };
  }

  public async addUser(registerData: IAddUserEvent) {
    const { fullname, username, email, companyId } = registerData;

    const existingCompany = await db.company.findFirst({
      where: {
        id: companyId,
      },
    });

    if (!existingCompany) {
      throw new BadRequestException(
        'Company not found',
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
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
        password: await encryptValue(`${username}*12345`),
        companyId: existingCompany.id,
        status: 'APPROVE',
        role: 'company_scanner',
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
        company: true,
        role: true,
      },
    });

    return {
      user: showNewUser,
    };
  }

  public async companyFindAll({
    page = 1,
    limit = 10,
    search,
    companyId,
    userId,
  }: IPaginationQuery) {
    const query: any = {
      companyId,
      NOT: {
        id: userId,
      },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    if (search) {
      query.OR = [
        {
          fullname: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where: query,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          fullname: true,
          email: true,
          isEmailVerified: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          userPreferences: true,
          role: true,
        },
      }),
      db.user.count({
        where: query,
      }),
    ]);

    return {
      users,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    };
  }
}
