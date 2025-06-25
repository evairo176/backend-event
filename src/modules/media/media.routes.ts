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
  /*
  #swagger.tags = ['Media']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  #swagger.requestBody = {
    require: true,
    content:{
      "multipart/form-data":{
        schema:{
          type:"object",
          properties:{
            file:{
              type:"string",
              format:"binary"
            }
          }
        }
      }
    }
  }
  */
);
mediaRoutes.post(
  '/media/upload-multiple',
  [
    authenticateJWT,
    aclMiddleware([ROLES.ADMIN, ROLES.MEMBER]),
    mediaMiddleware.multiple('files'),
  ],
  mediaController.multiple,

  /*
  #swagger.tags = ['Media']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  #swagger.requestBody = {
    require: true,
    content:{
      "multipart/form-data":{
        schema:{
          type:"object",
          properties:{
            files:{
              type:"array",
              items:{
                type:"string",
                format:"binary"
              }
            }
          }
        }
      }
    }
  }
  */
);
mediaRoutes.delete(
  '/media/remove',
  [authenticateJWT, aclMiddleware([ROLES.ADMIN, ROLES.MEMBER])],
  mediaController.remove,

  /*
  #swagger.tags = ['Media']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  #swagger.requestBody = {
    require: true,
    schemas:{
      $ref:"#/components/schemas/RemoveMediaRequest"
    }
  }
  */
);

export default mediaRoutes;
