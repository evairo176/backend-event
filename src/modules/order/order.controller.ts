import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.middleware';
import { OrderService } from './order.service';
import { HTTPSTATUS } from '../../config/http.config';
import { createOrderSchema } from '../../cummon/validators/order.validator';
import { generateOrderId } from '../../cummon/utils/id';
import { IPaginationQuery } from '../../cummon/interface/order.interface';

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

  public findAll = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const query = req?.query as unknown as IPaginationQuery;

      const { orders, limit, page, total, totalPages } =
        await this.orderService.findAll(query);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success find all orders',
        data: orders,
        pagination: {
          limit,
          page,
          total,
          totalPages,
        },
      });
    },
  );

  public findOne = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const params = req?.params;

      const { order } = await this.orderService.findOne(params.id);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success find one order',
        data: order,
      });
    },
  );

  public completed = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const params = req?.params;
      const userId = req?.user?.id;

      await this.orderService.completed(params.orderId, userId as string);

      return res.status(HTTPSTATUS.OK).json({
        message: 'order completed',
      });
    },
  );

  public pending = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const params = req?.params;
      const userId = req?.user?.id;

      const result = await this.orderService.pending(
        params.orderId,
        userId as string,
      );

      return res.status(HTTPSTATUS.OK).json({
        data: result,
        message: 'order pending',
      });
    },
  );

  public cancelled = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const params = req?.params;
      const userId = req?.user?.id;

      const result = await this.orderService.cancelled(
        params.orderId,
        userId as string,
      );

      return res.status(HTTPSTATUS.OK).json({
        data: result,
        message: 'order pending',
      });
    },
  );

  public remove = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const params = req?.params;

      const result = await this.orderService.remove(params.orderId);

      return res.status(HTTPSTATUS.OK).json({
        data: result,
        message: 'success to remove an order',
      });
    },
  );

  public findAllByMember = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const query = req?.query as unknown as IPaginationQuery;
      const userId = req?.user?.id;
      const { orders, limit, page, total, totalPages } =
        await this.orderService.findAllByMember({
          ...query,
          createById: userId as string,
        });

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success find all orders',
        data: orders,
        pagination: {
          limit,
          page,
          total,
          totalPages,
        },
      });
    },
  );
}
