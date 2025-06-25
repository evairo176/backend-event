import EventController from './event.controller';
import EventService from './event.service';

const eventService = new EventService();
const eventController = new EventController(eventService);

export { eventService, eventController };
