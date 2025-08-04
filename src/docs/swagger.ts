import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerOutput from './swagger-output.json'; // hasil generate dari step 1

export const setupSwagger = (app: Express) => {
  app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));
};
