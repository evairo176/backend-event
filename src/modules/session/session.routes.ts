import { Router } from 'express';
import { sessionController } from './session.module';
import { authenticateJWT } from '../../cummon/strategies/jwt.strategy';

const sessionRoutes = Router();

sessionRoutes.get(
  '/session/all',
  authenticateJWT,
  sessionController.getAllSession,
  /*
  #swagger.tags = ['Session']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  */
);
sessionRoutes.get(
  '/session/',
  authenticateJWT,
  sessionController.getSession,
  /*
  #swagger.tags = ['Session']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  */
);

sessionRoutes.delete(
  '/session/:id',
  authenticateJWT,
  sessionController.deleteSession,
  /*
  #swagger.tags = ['Session']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  */
);

export default sessionRoutes;
