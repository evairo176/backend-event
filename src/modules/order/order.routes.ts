import { Router } from 'express';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';
import { ROLES } from '../../cummon/enums/role.enum';
import aclMiddleware from '../../middlewares/acl.middleware';
import { oderController } from './order.module';

const orderRoutes = Router();

orderRoutes.post(
  '/order',

  [authenticateJWT, aclMiddleware([ROLES.MEMBER, ROLES.ADMIN, ROLES.MANAGER])],
  oderController.create,
);

export default orderRoutes;
