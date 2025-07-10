import { OrderController } from './order.controller';
import { OrderService } from './order.service';

const orderService = new OrderService();
const oderController = new OrderController(orderService);

export { orderService, oderController };
