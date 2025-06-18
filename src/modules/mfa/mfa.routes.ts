import { Router } from 'express';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';
import { mfaController } from './mfa.module';

const mfaRoutes = Router();

mfaRoutes.get('/mfa/setup', authenticateJWT, mfaController.generateMFASetup);
mfaRoutes.post('/mfa/verify', authenticateJWT, mfaController.verifyMFASetup);
mfaRoutes.put('/mfa/revoke', authenticateJWT, mfaController.revokeMFASetup);

mfaRoutes.post('/mfa/verify-login', mfaController.verifyMFAForLogin);

export default mfaRoutes;
