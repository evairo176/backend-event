import { Router } from 'express';
import { categoryController } from './category.module';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';
import aclMiddleware from '../../middlewares/acl.middleware';
import { ROLES } from '../../cummon/enums/role.enum';

const categoryRoutes = Router();

categoryRoutes.post(
  '/category',

  [authenticateJWT, aclMiddleware([ROLES.ADMIN])],
  categoryController.create,

  /**
   #swagger.tags = ["Category"]
   #swagger.security = [{
      "bearerAuth": {}
   }]

   #swagger.requestBody = {
      require: true,
      schema:{
        $ref:"#components/schemas/CreateCategoryRequest"
      }
   }
   */
);
categoryRoutes.get(
  '/category',
  categoryController.findAll,
  /**
 #swagger.tags = ['Category']
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
categoryRoutes.get(
  '/category/:id',
  categoryController.findOne,

  /**
   #swagger.tags = ["Category"]
   */
);
categoryRoutes.put(
  '/category/:id',
  [authenticateJWT, aclMiddleware([ROLES.ADMIN])],
  categoryController.update,

  /**
   #swagger.tags = ["Category"]
   #swagger.security = [{
      "bearerAuth": {}
   }]

   #swagger.requestBody = {
      require: true,
      schema:{
        $ref:"#components/schemas/CreateCategoryRequest"
      }
   }
   */
);
categoryRoutes.delete(
  '/category/:id',
  [authenticateJWT, aclMiddleware([ROLES.ADMIN])],
  categoryController.remove,

  /**
   #swagger.tags = ["Category"]
   #swagger.security = [{
      "bearerAuth": {}
   }]

   */
);

export default categoryRoutes;
