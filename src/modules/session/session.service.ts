import { IPaginationQuery } from '../../cummon/interface/session.interface';
import { NotFoundException } from '../../cummon/utils/catch-errors';
import { db } from '../../database/database';

export class SessionService {
  public async getAllSessionUser(userId: string) {
    const sessions = await db.session.findMany({
      where: {
        expiredAt: {
          gt: new Date(Date.now()),
        },
        NOT: {
          userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        userId: true,
        userAgent: true,
        createdAt: true,
        expiredAt: true,
        user: {
          select: {
            fullname: true,
            email: true,
            username: true,
            profilePicture: true,
            isEmailVerified: true,
          },
        },
      },
    });

    return {
      sessions,
    };
  }
  public async getAllSession({
    page = 1,
    limit = 10,
    search,
    userId,
  }: IPaginationQuery) {
    // const sessions = await db.session.findMany({
    //   where: {
    //     userId,
    //     expiredAt: {
    //       gt: new Date(Date.now()),
    //     },
    //   },

    // });

    // return {
    //   sessions,
    // };

    const query: any = {
      userId,
      expiredAt: {
        gt: new Date(Date.now()),
      },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    if (search) {
      query.OR = [
        // {
        //   name: {
        //     contains: search,
        //     mode: 'insensitive',
        //   },
        // },
      ];
    }

    const [sessions, total] = await Promise.all([
      db.session.findMany({
        where: query,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userId: true,
          userAgent: true,
          createdAt: true,
          expiredAt: true,
        },
      }),
      db.session.count({
        where: query,
      }),
    ]);

    return {
      sessions,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  public async getSessionById(sessionId: string) {
    const session = await db.session.findFirst({
      where: {
        id: sessionId,
      },
      select: {
        id: true,
        userId: true,
        userAgent: true,
        createdAt: true,
        expiredAt: true,
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
            userPreferences: {
              select: {
                enable2FA: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return {
      user: session.user,
    };
  }

  public async deleteSession(sessionId: string, userId: string) {
    const deletedSession = await db.session.delete({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!deletedSession) {
      throw new NotFoundException('Session not found');
    }
    return;
  }
}
