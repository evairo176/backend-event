import aclMiddleware from '../../middlewares/acl.middleware';
import { ROLES } from '../../cummon/enums/role.enum';
import { Router } from 'express';
import { userController } from './user.module';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';

const userRoutes = Router();

userRoutes.get(
  '/user',
  [authenticateJWT, aclMiddleware([ROLES.ADMIN])],
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

export default userRoutes;
