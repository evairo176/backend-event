import { Router } from 'express';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';
import aclMiddleware from '../../middlewares/acl.middleware';
import { ticketController } from './ticket,module';
import { ROLES } from '../../cummon/enums/role.enum';

const ticketRoutes = Router();

ticketRoutes.post(
  '/ticket',

  [authenticateJWT, aclMiddleware([ROLES.ADMIN])],
  ticketController.create,

  /**
   #swagger.tags = ["Ticket"]
   #swagger.security = [{
      "bearerAuth": {}
   }]

   #swagger.requestBody = {
      require: true,
      schema:{
        $ref:"#components/schemas/CreateTicketRequest"
      }
   }
   */
);
ticketRoutes.get(
  '/ticket',
  ticketController.findAll,

  /**
 #swagger.tags = ['Ticket']
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
ticketRoutes.get(
  '/ticket/:id',
  ticketController.findOne,

  /**
   #swagger.tags = ["Ticket"]
   */
);
ticketRoutes.put(
  '/ticket/:id',
  [authenticateJWT, aclMiddleware([ROLES.ADMIN])],
  ticketController.update,

  /**
   #swagger.tags = ["Ticket"]
   #swagger.security = [{
      "bearerAuth": {}
   }]

   #swagger.requestBody = {
      require: true,
      schema:{
        $ref:"#components/schemas/CreateTicketRequest"
      }
   }
   */
);
ticketRoutes.delete(
  '/ticket/:id',
  [authenticateJWT, aclMiddleware([ROLES.ADMIN])],
  ticketController.remove,

  /**
   #swagger.tags = ["Ticket"]
   #swagger.security = [{
      "bearerAuth": {}
   }]

   */
);

ticketRoutes.get(
  '/ticket/:id/event',
  ticketController.findAllByEvent,

  /**
   #swagger.tags = ["Ticket"]
   */
);

export default ticketRoutes;
