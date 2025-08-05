import { Router } from 'express';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';
import aclMiddleware from '../../middlewares/acl.middleware';
import mediaMiddleware from '../../middlewares/media.middleware';
import { ROLES } from '../../cummon/enums/role.enum';
import { mediaController } from './media.module';
import { ROLE_USER } from '@prisma/client';

const mediaRoutes = Router();

mediaRoutes.post(
  '/media/upload-single',
  [
    authenticateJWT,
    aclMiddleware([ROLE_USER.admin, ROLE_USER.company, ROLE_USER.member]),
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
    aclMiddleware([ROLE_USER.admin, ROLE_USER.company, ROLE_USER.member]),
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
  [
    authenticateJWT,
    aclMiddleware([ROLE_USER.admin, ROLE_USER.company, ROLE_USER.member]),
  ],
  mediaController.remove,

  /*
  #swagger.tags = ['Media']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  #swagger.requestBody = {
    required: true,
    schema: {
      $ref: "#/components/schemas/RemoveMediaRequest"
    }
  }
  */
);

export default mediaRoutes;
