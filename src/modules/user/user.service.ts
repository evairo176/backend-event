import { IPaginationQuery } from '../../cummon/interface/user.interface';
import { db } from '../../database/database';

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
}
