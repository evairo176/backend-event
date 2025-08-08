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
  voucherController.findOneByCode,
  [
    authenticateJWT,
    aclMiddleware([ROLE_USER.company_scanner, ROLE_USER.admin]),
  ],
  /**
   #swagger.tags = ["Voucher"]
   */
);

export default voucherRoutes;
