import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerOutput from './swagger-output.json'; // hasil generate dari step 1
import path from 'path';

export const setupSwagger = (app: Express) => {
  app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));

  app.get('/api-docs/swagger.json', (_, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerOutput);
  });

  // Redirect /api-docs to the Swagger UI
  app.get('/api-docs', (_, res) => {
    res.redirect('/swagger-ui/');
  });
};
