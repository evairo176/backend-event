import { Router } from 'express';
import { eventController } from './event.module';

const eventRoutes = Router();

eventRoutes.post('/event', eventController.create);
eventRoutes.get('/event', eventController.findAll);
eventRoutes.get('/event/:id', eventController.findOne);
eventRoutes.put('/event/:id', eventController.update);
eventRoutes.delete('/event/:id', eventController.remove);
eventRoutes.get('/event/:slug/slug', eventController.findOneBySlug);

export default eventRoutes;
