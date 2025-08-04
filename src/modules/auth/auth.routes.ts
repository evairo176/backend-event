import { Router } from 'express';
import { authController } from './auth.module';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';
import aclMiddleware from '../../middlewares/acl.middleware';
import { ROLES } from '../../cummon/enums/role.enum';
import { ROLE_USER } from '@prisma/client';

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
  '/auth/register/company',
  authController.companyRegister,

  /*
  #swagger.tags = ['Auth']
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

authRoutes.put(
  '/auth/me/update',
  authenticateJWT,
  aclMiddleware([ROLES.ADMIN, ROLES.MEMBER, ROLES.MANAGER]),
  authController.updateProfile,
  /*
  #swagger.tags = ['Auth']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  */
);

authRoutes.post(
  '/auth/verify/email',
  authController.verifyEmail,
  /* 
    #swagger.tags = ['Auth']
    #swagger.requestBody = {
        required: true,
        schema: {
        $ref: "#/components/schemas/VerifyEmailRequest"
        }
    }
    */
);
authRoutes.put(
  '/auth/password/update',
  authenticateJWT,
  aclMiddleware([ROLES.ADMIN, ROLES.MEMBER, ROLES.MANAGER]),
  authController.updatePassword,
);
authRoutes.post('/auth/password/forgot', authController.forgotPassword);
authRoutes.post('/auth/password/reset', authController.resetPassword);
authRoutes.post('/auth/logout', authenticateJWT, authController.logout);

authRoutes.get('/auth/refresh', authController.refreshToken);

authRoutes.get(
  '/test-acl',
  authenticateJWT,
  aclMiddleware([ROLES.ADMIN, ROLES.MEMBER]),
  (req, res) => {
    return res.status(200).json({
      message: 'success',
    });
  },
);

export default authRoutes;
