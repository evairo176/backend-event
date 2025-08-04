import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.middleware';
import { UserService } from './user.service';
import { IPaginationQuery } from '../../cummon/interface/user.interface';
import { HTTPSTATUS } from '../../config/http.config';

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public findAll = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const query = req?.query as unknown as IPaginationQuery;
      const userId = req?.user?.id;
      const { users, limit, page, total, totalPages } =
        await this.userService.findAll({
          ...query,
          userId: userId as string,
        });

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success find all user',
        data: users,
        pagination: {
          limit,
          page,
          total,
          totalPages,
        },
      });
    },
  );
}
