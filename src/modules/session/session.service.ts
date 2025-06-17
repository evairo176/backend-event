import { NotFoundException } from '../../cummon/utils/catch-errors';
import { db } from '../../database/database';

export class SessionService {
  public async getAllSession(userId?: string) {
    const sessions = await db.session.findMany({
      where: {
        userId,
        expiredAt: {
          gt: new Date(Date.now()),
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
      },
    });

    return {
      sessions,
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
            name: true,
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
