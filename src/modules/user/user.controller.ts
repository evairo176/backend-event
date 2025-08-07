import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.middleware';
import { UserService } from './user.service';
import { IPaginationQuery } from '../../cummon/interface/user.interface';
import { HTTPSTATUS } from '../../config/http.config';
import {
  addUserSchema,
  updateActivateSchema,
} from '../../cummon/validators/user.validator';

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

  public updateActivate = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = updateActivateSchema.parse(req?.body);
      const { status } = await this.userService.updateActivate({
        ...body,
      });
      return res.status(HTTPSTATUS.OK).json({
        message: 'Update activate successfully',
        data: status,
      });
    },
  );

  public addUser = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = addUserSchema.parse(req?.body);
      const companyId = req?.user?.companyId;
      const result = await this.userService.addUser({
        ...body,
        companyId: companyId as string,
      });

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success add user',
        data: result,
      });
    },
  );

  public companyFindAll = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const query = req?.query as unknown as IPaginationQuery;
      const userId = req?.user?.id;
      const companyId = req?.user?.companyId;
      const { users, limit, page, total, totalPages } =
        await this.userService.companyFindAll({
          ...query,
          companyId: companyId as string,
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
