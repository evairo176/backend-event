import { Router } from 'express';
import { eventController } from './event.module';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';

const eventRoutes = Router();

eventRoutes.post(
  '/event',
  authenticateJWT,
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
  '/event/:id',
  eventController.findOne,
  /**
   #swagger.tags = ["Events"]

   */
);
eventRoutes.put(
  '/event/:id',
  authenticateJWT,
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
