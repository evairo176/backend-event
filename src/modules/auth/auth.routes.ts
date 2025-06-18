import { Router } from 'express';
import { authController } from './auth.module';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';

const authRoutes = Router();

authRoutes.post(
  '/auth/register',
  authController.register,

  /*
  #swagger.tags = ['Auth']
  #swagger.requestBody = {
    required: true,
    schema: {
      $ref: "#/components/schemas/RegisterRequest"
    }
  }
  */
);

authRoutes.post(
  '/auth/login',

  authController.login,
  /* 
    #swagger.tags = ['Auth']
    #swagger.requestBody = {
        required: true,
        schema: {
        $ref: "#/components/schemas/LoginRequest"
        }
    }
    */
);

authRoutes.get(
  '/auth/me',
  authenticateJWT,
  authController.me,
  /*
  #swagger.tags = ['Auth']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  */
);

export default authRoutes;
