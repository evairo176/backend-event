import { Router } from 'express';
import { bannerController } from './banner.module';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';
import aclMiddleware from '../../middlewares/acl.middleware';
import { ROLES } from '../../cummon/enums/role.enum';

const bannerRoutes = Router();

bannerRoutes.post(
  '/banner',

  [authenticateJWT, aclMiddleware([ROLES.ADMIN])],
  bannerController.create,

  /**
   #swagger.tags = ["Banner"]
   #swagger.security = [{
      "bearerAuth": {}
   }]

   #swagger.requestBody = {
      require: true,
      schema:{
        $ref:"#components/schemas/CreateBannerRequest"
      }
   }
   */
);
bannerRoutes.get(
  '/banner',
  bannerController.findAll,
  /**
 #swagger.tags = ['Banner']
 #swagger.description = 'Endpoint untuk mengambil daftar kategori'
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
bannerRoutes.get(
  '/banner/:id',
  bannerController.findOne,

  /**
   #swagger.tags = ["Banner"]
   */
);
bannerRoutes.put(
  '/banner/:id',
  [authenticateJWT, aclMiddleware([ROLES.ADMIN])],
  bannerController.update,

  /**
   #swagger.tags = ["Banner"]
   #swagger.security = [{
      "bearerAuth": {}
   }]

   #swagger.requestBody = {
      require: true,
      schema:{
        $ref:"#components/schemas/CreateBannerRequest"
      }
   }
   */
);
bannerRoutes.delete(
  '/banner/:id',
  [authenticateJWT, aclMiddleware([ROLES.ADMIN])],
  bannerController.remove,

  /**
   #swagger.tags = ["Banner"]
   #swagger.security = [{
      "bearerAuth": {}
   }]

   */
);

export default bannerRoutes;
