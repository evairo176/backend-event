import { Router } from 'express';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';
import aclMiddleware from '../../middlewares/acl.middleware';
import { ticketController } from './ticket,module';
import { ROLE_USER } from '@prisma/client';

const ticketRoutes = Router();

ticketRoutes.post(
  '/ticket',

  [authenticateJWT, aclMiddleware([ROLE_USER.admin, ROLE_USER.company_owner])],
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
  [authenticateJWT, aclMiddleware([ROLE_USER.admin, ROLE_USER.company_owner])],
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
  [authenticateJWT, aclMiddleware([ROLE_USER.admin, ROLE_USER.company_owner])],
  ticketController.remove,

  /**
   #swagger.tags = ["Ticket"]
   #swagger.security = [{
      "bearerAuth": {}
   }]

   */
);

ticketRoutes.get(
  '/ticket/:eventId/event',
  ticketController.findAllByEvent,

  /**
   #swagger.tags = ["Ticket"]
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

export default ticketRoutes;
