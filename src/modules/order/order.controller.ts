import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.middleware';
import { OrderService } from './order.service';
import { HTTPSTATUS } from '../../config/http.config';
import { createOrderSchema } from '../../cummon/validators/order.validator';
import { generateOrderId } from '../../cummon/utils/id';

export class OrderController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  public create = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const userId = req?.user?.id;

      const body = createOrderSchema.parse({
        ...req?.body,
      });

      const orderId = await generateOrderId();

      const result = await this.orderService.create({
        ...body,
        createById: userId as string,
        updatedById: userId as string,
        orderId,
      });
      return res.status(HTTPSTATUS.CREATED).json({
        message: 'Success create order',
        data: result,
      });
    },
  );
}
