import aclMiddleware from '../../middlewares/acl.middleware';
import { Router } from 'express';
import { userController } from './user.module';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';
import { ROLE_USER } from '@prisma/client';

const userRoutes = Router();

userRoutes.get(
  '/user',
  [authenticateJWT, aclMiddleware([ROLE_USER.admin])],
  userController.findAll,
  /**
 #swagger.tags = ['User']
 #swagger.description = 'Endpoint untuk mengambil daftar User'
 #swagger.parameters['page'] = {
   in: 'query',
   description: 'Halaman ke berapa',
   required: false,
   type: 'integer',
   example: 1
 }
 #swagger.parameters['limit'] = {
   in: 'query',
   description: 'Jumlah data per halaman',
   required: false,
   type: 'integer',
   example: 10
 }
 #swagger.parameters['search'] = {
   in: 'query',
   description: 'Kata kunci pencarian kategori',
   required: false,
   type: 'string',
   example: 'buah'
 }
 */
);

userRoutes.put(
  '/user/activate',
  [authenticateJWT, aclMiddleware([ROLE_USER.admin, ROLE_USER.company_owner])],
  userController.updateActivate,
  /**
 #swagger.tags = ['User']

 }
 */
);

userRoutes.post(
  '/user-add',
  [authenticateJWT, aclMiddleware([ROLE_USER.company_owner])],
  userController.addUser,
  /**
 #swagger.tags = ['User']

 }
 */
);

userRoutes.get(
  '/user-company',
  [authenticateJWT, aclMiddleware([ROLE_USER.company_owner])],
  userController.companyFindAll,
  /**
 #swagger.tags = ['User']
 #swagger.description = 'Endpoint untuk mengambil daftar User'
 #swagger.parameters['page'] = {
   in: 'query',
   description: 'Halaman ke berapa',
   required: false,
   type: 'integer',
   example: 1
 }
 #swagger.parameters['limit'] = {
   in: 'query',
   description: 'Jumlah data per halaman',
   required: false,
   type: 'integer',
   example: 10
 }
 #swagger.parameters['search'] = {
   in: 'query',
   description: 'Kata kunci pencarian kategori',
   required: false,
   type: 'string',
   example: 'buah'
 }
 */
);

export default userRoutes;
