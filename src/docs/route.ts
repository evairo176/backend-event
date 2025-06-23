import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerOutput from './swagger-output.json';

export default function docs(app: Express) {
  app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));
}
