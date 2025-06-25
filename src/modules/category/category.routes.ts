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
   #swagger.tags = ["Category"]
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
