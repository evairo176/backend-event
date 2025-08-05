import { Router } from 'express';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';
import { ROLES } from '../../cummon/enums/role.enum';
import aclMiddleware from '../../middlewares/acl.middleware';
import { oderController } from './order.module';
import { ROLE_USER } from '@prisma/client';

const orderRoutes = Router();

orderRoutes.post(
  '/orders',

  [authenticateJWT, aclMiddleware([ROLES.MEMBER])],
  // [authenticateJWT, aclMiddleware([ROLES.MEMBER])],
  oderController.create,
);

orderRoutes.get(
  '/orders',
  [authenticateJWT, aclMiddleware([ROLE_USER.admin])],
  oderController.findAll,
);

orderRoutes.get(
  '/orders/:orderId',
  [
    authenticateJWT,
    aclMiddleware([ROLE_USER.member, ROLE_USER.company, ROLE_USER.admin]),
  ],
  oderController.findOne,
);

orderRoutes.get(
  '/orders/member',
  [authenticateJWT, aclMiddleware([ROLE_USER.member])],
  oderController.findAllByMember,
);

orderRoutes.get(
  '/orders-company',
  [authenticateJWT, aclMiddleware([ROLE_USER.company])],
  oderController.findAllByCompany,
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
  [authenticateJWT, aclMiddleware([ROLE_USER.admin])],
  oderController.remove,
);

orderRoutes.get(
  '/orders-history',
  [authenticateJWT, aclMiddleware([ROLE_USER.member])],
  oderController.findAllByMember,
);

orderRoutes.get(
  '/orders-dashboard',
  [authenticateJWT, aclMiddleware([ROLE_USER.admin])],
  oderController.dashboardFindAll,
);

orderRoutes.get(
  '/orders-dashboard/chart',
  [authenticateJWT, aclMiddleware([ROLE_USER.admin])],
  oderController.dashboardChart,
);

orderRoutes.get(
  '/orders-dashboard/chart-company',
  [authenticateJWT, aclMiddleware([ROLE_USER.company])],
  oderController.dashboardChartCompany,
);

orderRoutes.post('/orders/midtrans', oderController.midtransWebhook);

export default orderRoutes;
