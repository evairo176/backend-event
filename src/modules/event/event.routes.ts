import { Router } from 'express';
import { eventController } from './event.module';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';
import aclMiddleware from '../../middlewares/acl.middleware';
import { ROLE_USER } from '@prisma/client';

const eventRoutes = Router();

eventRoutes.post(
  '/event',
  [authenticateJWT, aclMiddleware([ROLE_USER.admin, ROLE_USER.company])],
  eventController.create,

  /**
   #swagger.tags = ["Events"]
   #swagger.security = [{
      "bearerAuth": {}
   }]

   #swagger.requestBody = {
      require: true,
      schema:{
        $ref:"#components/schemas/CreateEventRequest"
      }
   }
   */
);
eventRoutes.get(
  '/event',
  eventController.findAll,
  /**
   #swagger.tags = ["Events"]


   */
);

eventRoutes.get(
  '/event-company',
  [authenticateJWT, aclMiddleware([ROLE_USER.company])],
  eventController.companyFindAll,
  /**
   #swagger.tags = ["Events"]


   */
);
eventRoutes.get(
  '/event/:id',
  eventController.findOne,
  /**
   #swagger.tags = ["Events"]

   */
);
eventRoutes.put(
  '/event/:id',
  [authenticateJWT, aclMiddleware([ROLE_USER.admin, ROLE_USER.company])],
  eventController.update,
  /**
   #swagger.tags = ["Events"]
   #swagger.security = [{
      "bearerAuth": {}
   }]

   #swagger.requestBody = {
      require: true,
      schema:{
        $ref:"#components/schemas/CreateEventRequest"
      }
   }
   */
);
eventRoutes.delete(
  '/event/:id',
  authenticateJWT,
  eventController.remove,
  /**
   #swagger.tags = ["Events"]
   #swagger.security = [{
      "bearerAuth": {}
   }]

   */
);
eventRoutes.get(
  '/event/:slug/slug',
  eventController.findOneBySlug,
  /**
   #swagger.tags = ["Events"]

   */
);

export default eventRoutes;
