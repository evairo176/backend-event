import { NextFunction, Request, Response } from 'express';
import { ROLES } from '../cummon/enums/role.enum';
import { HttpException } from '../cummon/utils/catch-errors';
import { HTTPSTATUS } from '../config/http.config';
import { ErrorCode } from '../cummon/enums/error-code.enum';

export default (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role as string;

    if (!role || !roles.includes(role)) {
      throw new HttpException(
        'Role not found',
        HTTPSTATUS.FORBIDDEN,
        ErrorCode.ACCESS_FORBIDDEN,
      );
    }

    next();
  };
};
