import { Router } from 'express';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';
import { ROLES } from '../../cummon/enums/role.enum';
import aclMiddleware from '../../middlewares/acl.middleware';
import { oderController } from './order.module';

const orderRoutes = Router();

orderRoutes.post(
  '/orders',

  [authenticateJWT, aclMiddleware([ROLES.MEMBER, ROLES.ADMIN, ROLES.MANAGER])],
  oderController.create,
);
orderRoutes.get(
  '/orders',
  [authenticateJWT, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  oderController.findAll,
);

orderRoutes.put(
  '/orders/:orderId/completed',

  oderController.completed,
);

orderRoutes.put(
  '/orders/:orderId/pending',

  oderController.pending,
);

orderRoutes.delete(
  '/orders/:orderId/remove',
  [authenticateJWT, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  oderController.remove,
);

export default orderRoutes;
