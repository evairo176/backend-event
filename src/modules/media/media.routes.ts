import { Router } from 'express';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';
import aclMiddleware from '../../middlewares/acl.middleware';
import mediaMiddleware from '../../middlewares/media.middleware';
import { ROLES } from '../../cummon/enums/role.enum';
import { mediaController } from './media.module';

const mediaRoutes = Router();

mediaRoutes.post(
  '/media/upload-single',
  [
    authenticateJWT,
    aclMiddleware([ROLES.ADMIN, ROLES.MEMBER]),
    mediaMiddleware.single('file'),
  ],
  mediaController.single,
);
mediaRoutes.post(
  '/media/upload-multiple',
  [
    authenticateJWT,
    aclMiddleware([ROLES.ADMIN, ROLES.MEMBER]),
    mediaMiddleware.multiple('files'),
  ],
  mediaController.multiple,
);
mediaRoutes.delete(
  '/media/remove',
  [authenticateJWT, aclMiddleware([ROLES.ADMIN, ROLES.MEMBER])],
  mediaController.remove,
);

export default mediaRoutes;
