import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.middleware';
import { OrderService } from './order.service';
import { HTTPSTATUS } from '../../config/http.config';
import { createOrderSchema } from '../../cummon/validators/order.validator';
import { generateOrderId } from '../../cummon/utils/id';
import { IPaginationQuery } from '../../cummon/interface/order.interface';
import crypto from 'crypto';
import { config } from '../../config/app.config';
import { TimeFilter } from '../../cummon/utils/dashboard';

export class OrderController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  public create = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const userId = req?.user?.id;

      const body = createOrderSchema.parse(req?.body);

      const orderId = await generateOrderId();

      const result = await this.orderService.create(body, {
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

      const { order } = await this.orderService.findOne(params.orderId);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success find one order',
        data: order,
      });
    },
  );

  // public completed = asyncHandler(
  //   async (req: Request, res: Response): Promise<any> => {
  //     const params = req?.params;
  //     const userId = req?.user?.id;

  //     await this.orderService.completed(params.orderId, userId as string);

  //     return res.status(HTTPSTATUS.OK).json({
  //       message: 'order completed',
  //     });
  //   },
  // );

  // public pending = asyncHandler(
  //   async (req: Request, res: Response): Promise<any> => {
  //     const params = req?.params;
  //     const userId = req?.user?.id;

  //     const result = await this.orderService.pending(
  //       params.orderId,
  //       userId as string,
  //     );

  //     return res.status(HTTPSTATUS.OK).json({
  //       data: result,
  //       message: 'order pending',
  //     });
  //   },
  // );

  // public cancelled = asyncHandler(
  //   async (req: Request, res: Response): Promise<any> => {
  //     const params = req?.params;
  //     const userId = req?.user?.id;

  //     const result = await this.orderService.cancelled(
  //       params.orderId,
  //       userId as string,
  //     );

  //     return res.status(HTTPSTATUS.OK).json({
  //       data: result,
  //       message: 'order pending',
  //     });
  //   },
  // );

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

  public findAllByCompany = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const query = req?.query as unknown as IPaginationQuery;
      const companyId = req?.user?.companyId;

      // console.log({ user: req?.user });
      const { orders, limit, page, total, totalPages } =
        await this.orderService.findAllByCompany({
          ...query,
          companyId: companyId as string,
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
  public midtransWebhook = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const payload = req.body;
      console.log('🔥 Callback masuk:', req.body);

      const {
        order_id,
        status_code,
        gross_amount,
        signature_key,
        payment_type,
        settlement_time, // <-- ambil ini (jika ada)
        transaction_time, // <-- fallback kalau settlement_time tidak ada
      } = payload;

      // Step 1: Buat hash berdasarkan data Midtrans
      const input =
        order_id + status_code + gross_amount + config.MIDTRANS.SERVER_KEY;
      const expectedSignature = crypto
        .createHash('sha512')
        .update(input)
        .digest('hex');

      // Step 2: Cek apakah signature valid
      if (expectedSignature !== signature_key) {
        console.warn('Signature mismatch: Potential spoofed request');
        return res.status(403).json({ message: 'Invalid signature' });
      }

      // Step 3: Lanjutkan logika status pembayaran
      const transactionStatus = payload.transaction_status;

      // Step 3: Tentukan payment date
      const paymentDate =
        settlement_time || transaction_time || new Date().toISOString();

      await this.orderService.midtransWebhook({
        transactionStatus,
        order_id,
        paymentType: payment_type,
        paymentDate,
      });

      return res.status(HTTPSTATUS.OK).json({
        message: 'Midtrans webhook processed successfully',
      });
    },
  );

  public dashboardFindAll = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const query = req?.query as unknown as IPaginationQuery;

      const { orders, total } = await this.orderService.dashboardFindAll({
        ...query,
        filter: query?.filter as string,
      });

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success find all orders',
        data: orders,
        pagination: {
          total,
        },
      });
    },
  );

  public dashboardChart = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const result = await this.orderService.dashboardOrderChart();

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success find all orders for dashboard chart',
        data: result,
      });
    },
  );

  public dashboardChartCompany = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const companyId = req?.user?.companyId;
      const result = await this.orderService.dashboardOrderChartCompany({
        companyId: companyId as string,
      });

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success find all orders for dashboard chart',
        data: result,
      });
    },
  );
}
