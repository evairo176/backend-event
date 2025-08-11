import { Router } from 'express';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';
import aclMiddleware from '../../middlewares/acl.middleware';
import { ROLE_USER } from '@prisma/client';
import { voucherController } from './voucher.module';

const voucherRoutes = Router();

voucherRoutes.post(
  '/voucher-scan',
  [authenticateJWT, aclMiddleware([ROLE_USER.company_scanner])],
  voucherController.scanVoucher,

  /**
   #swagger.tags = ["Voucher"]
   #swagger.security = [{
      "bearerAuth": {}
   }]
   */
);

voucherRoutes.get(
  '/voucher/:code',
  [
    authenticateJWT,
    aclMiddleware([ROLE_USER.company_scanner, ROLE_USER.admin]),
  ],
  voucherController.findOneByCode,

  /**
   #swagger.tags = ["Voucher"]
   */
);

voucherRoutes.get(
  '/voucher-scan-history',
  [authenticateJWT, aclMiddleware([ROLE_USER.company_scanner])],
  voucherController.findAllByUserId,
  /*
  #swagger.tags = ['Voucher']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  */
);
export default voucherRoutes;
