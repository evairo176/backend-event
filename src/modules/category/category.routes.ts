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
);
categoryRoutes.get('/category', categoryController.findAll);
categoryRoutes.get('/category/:id', categoryController.findOne);
categoryRoutes.put(
  '/category/:id',
  [authenticateJWT, aclMiddleware([ROLES.ADMIN])],
  categoryController.update,
);
categoryRoutes.delete(
  '/category/:id',
  [authenticateJWT, aclMiddleware([ROLES.ADMIN])],
  categoryController.remove,
);

export default categoryRoutes;
