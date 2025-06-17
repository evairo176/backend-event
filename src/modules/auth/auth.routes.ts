import { Router } from 'express';
import { authController } from './auth.module';

const authRoutes = Router();

authRoutes.post(
  '/register',
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
  '/login',
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

export default authRoutes;
