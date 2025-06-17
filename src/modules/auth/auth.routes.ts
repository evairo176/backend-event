import { Router } from 'express';
import { authController } from './auth.module';
// import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';

const authRoutes = Router();

authRoutes.post('/register', authController.register);
authRoutes.post('/login', authController.login);

export default authRoutes;
