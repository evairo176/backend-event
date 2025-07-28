import { Router } from 'express';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';
import { ROLES } from '../../cummon/enums/role.enum';
import aclMiddleware from '../../middlewares/acl.middleware';
import { oderController } from './order.module';

const orderRoutes = Router();

orderRoutes.post(
  '/orders',

  [authenticateJWT, aclMiddleware([ROLES.MEMBER, ROLES.ADMIN, ROLES.MANAGER])],
  // [authenticateJWT, aclMiddleware([ROLES.MEMBER])],
  oderController.create,
);

orderRoutes.get(
  '/orders',
  [authenticateJWT, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  oderController.findAll,
);

orderRoutes.get(
  '/orders/:orderId',
  [authenticateJWT, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  oderController.findOne,
);

orderRoutes.get(
  '/orders/member',
  [authenticateJWT, aclMiddleware([ROLES.ADMIN, ROLES.MEMBER, ROLES.MANAGER])],
  oderController.findAllByMember,
);

// orderRoutes.put(
//   '/orders/:orderId/completed',

//   oderController.completed,
// );

// orderRoutes.put(
//   '/orders/:orderId/pending',

//   oderController.pending,
// );

// orderRoutes.put(
//   '/orders/:orderId/cancelled',

//   oderController.cancelled,
// );

orderRoutes.delete(
  '/orders/:orderId/remove',
  [authenticateJWT, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  oderController.remove,
);

orderRoutes.get(
  '/orders-history',
  [authenticateJWT, aclMiddleware([ROLES.MEMBER, ROLES.ADMIN, ROLES.MANAGER])],
  oderController.findAllByMember,
);

orderRoutes.post('/orders/midtrans', oderController.midtransWebhook);

export default orderRoutes;
