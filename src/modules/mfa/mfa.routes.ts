import { Router } from 'express';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';
import { mfaController } from './mfa.module';

const mfaRoutes = Router();

mfaRoutes.get(
  '/mfa/setup',
  authenticateJWT,
  mfaController.generateMFASetup,
  /*
  #swagger.tags = ['MFA']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  */
);
mfaRoutes.post(
  '/mfa/verify',
  authenticateJWT,
  mfaController.verifyMFASetup,
  /*
  #swagger.tags = ['MFA']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  */
);
mfaRoutes.put(
  '/mfa/revoke',
  authenticateJWT,
  mfaController.revokeMFASetup,
  /*
  #swagger.tags = ['MFA']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  */
);

mfaRoutes.post(
  '/mfa/verify-login',
  mfaController.verifyMFAForLogin,
  /*
  #swagger.tags = ['MFA']

  */
);

export default mfaRoutes;
