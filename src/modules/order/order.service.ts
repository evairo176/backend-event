import dayjs from 'dayjs';
import { ErrorCode } from '../../cummon/enums/error-code.enum';
import {
  CreateOrderDto,
  IPaginationQuery,
  orderItemDto,
} from '../../cummon/interface/order.interface';
import {
  BadRequestException,
  NotFoundException,
} from '../../cummon/utils/catch-errors';
import { generateOrderId } from '../../cummon/utils/id';
import { PaymentMidtrans } from '../../cummon/utils/payment';
import { db } from '../../database/database';

import { nanoid } from 'nanoid';
import { Dashboard, TimeFilter } from '../../cummon/utils/dashboard';

export class OrderService {
  public async create(orderData: orderItemDto[], userData: CreateOrderDto) {
    return await db.$transaction(async (tx) => {
      // Ambil tiket & validasi sebelum membuat order
      let total = 0;

      for (const body of orderData) {
        const existingTicket = await tx.ticket.findFirst({
          where: { id: body.ticketId },
        });

        if (!existingTicket) {
          throw new BadRequestException(
            'Ticket not exists',
            ErrorCode.RESOURCE_NOT_FOUND,
          );
        }

        const existingEvent = await tx.event.findFirst({
          where: { id: body.eventId },
        });

        if (!existingEvent) {
          throw new NotFoundException(
            'Event not exists',
            ErrorCode.RESOURCE_NOT_FOUND,
          );
        }

        if (existingTicket.quantity < body.quantity) {
          throw new BadRequestException('Ticket quantity is not enough');
        }

        total += +existingTicket.price * +body.quantity;
      }

      // Buat orderId
      const orderId = await generateOrderId();

      // Midtrans request (masih tetap di luar loop dan di dalam transaksi)
      const paymentMidtrans = new PaymentMidtrans();
      const generatePayment = await paymentMidtrans.createLink({
        transaction_details: {
          gross_amount: total,
          order_id: orderId,
        },
      });

      // Simpan payment
      const payment = await tx.payment.create({
        data: {
          token: generatePayment.token,
          redirect_url: generatePayment.redirect_url,
        },
      });

      // Simpan order
      const createdOrder = await tx.order.create({
        data: {
          orderId,
          total,
          paymentId: payment.id,
          createById: userData?.createById,
          updatedById: userData?.createById,
        },
      });

      // Simpan orderItem berdasarkan masing-masing tiket
      for (const body of orderData) {
        const existingTicket = await tx.ticket.findFirst({
          where: { id: body.ticketId },
        });

        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            eventId: body.eventId,
            ticketId: body.ticketId,
            quantity: body.quantity,
            price: existingTicket!.price,
          },
        });
      }

      // Ambil order beserta relasinya
      const result = await tx.order.findFirst({
        where: { id: createdOrder.id },
        include: {
          items: {
            include: {
              event: true,
              ticket: true,
            },
          },
          payment: true,
        },
      });

      return result;
    });
  }

  public async findAll({ page = 1, limit = 10, search }: IPaginationQuery) {
    const query: any = {};

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    if (search) {
      query.OR = [
        // {
        //   name: {
        //     contains: search,
        //     mode: 'insensitive',
        //   },
        // },
        // {
        //   description: {
        //     contains: search,
        //     mode: 'insensitive',
        //   },
        // },
      ];
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where: query,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          payment: true,
        },
      }),
      db.order.count({
        where: query,
      }),
    ]);

    return {
      orders,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  public async findOne(orderId: string) {
    const order = await db.order.findFirst({
      where: {
        orderId,
      },
      include: {
        items: {
          include: {
            event: true,
            ticket: {
              include: {
                vouchers: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException(
        'Order not exists',
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
    return {
      order,
    };
  }

  public async completed(
    orderId: string,
    paymentType: string,
    paymentDate: string,
  ) {
    const order = await db.order.findFirst({
      where: {
        orderId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(
        'Order not exists',
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    if (order.status === 'COMPLETED') {
      throw new BadRequestException('You have been completed this order');
    }

    const result = [];

    for (const item of order.items) {
      const ticket = await db.ticket.findFirst({
        where: {
          id: item.ticketId,
        },
      });

      if (!ticket) {
        throw new NotFoundException(
          'Ticket on not exists this order',
          ErrorCode.RESOURCE_NOT_FOUND,
        );
      }
      const prefixTicketCode = order?.orderId.split('-')[3] || 'TICKET';

      const vouchers = Array.from({ length: item.quantity }).map(() => ({
        code: `${prefixTicketCode}_${nanoid(21)}`,
        ticketId: item.ticketId,
      }));

      // ✅ Execute all DB operations in a transaction
      const [createdVouchers, updatedOrder, updatedTicket] =
        await db.$transaction([
          db.voucherTicket.createMany({
            data: vouchers,
          }),
          db.order.update({
            where: {
              id: order.id,
            },
            data: {
              status: 'COMPLETED',
              paymentType,
              paymentDate,
            },
          }),
          db.ticket.update({
            where: {
              id: ticket.id,
            },
            data: {
              quantity: ticket.quantity - item.quantity,
            },
          }),
        ]);

      result.push({
        createdVouchers,
        updatedOrder,
        updatedTicket,
      });
    }

    return result;
  }
  public async pending(orderId: string) {
    const order = await db.order.findFirst({
      where: {
        orderId,
      },
    });

    if (!order) {
      throw new NotFoundException(
        'Order not exists',
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    if (order.status === 'COMPLETED') {
      throw new BadRequestException('You have been completed this order');
    }

    if (order.status === 'PENDING') {
      throw new BadRequestException('This order is already payment pending');
    }

    const result = await db.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: 'PENDING',
      },
    });
    return result;
  }
  public async cancelled(orderId: string) {
    const order = await db.order.findFirst({
      where: {
        orderId,
      },
    });

    if (!order) {
      throw new NotFoundException(
        'Order not exists',
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    if (order.status === 'COMPLETED') {
      throw new BadRequestException('You have been completed this order');
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('This order is already cancelled');
    }

    const result = await db.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: 'CANCELLED',
      },
    });

    console.log('Order cancelled:', result);
    return result;
  }

  public async remove(orderId: string) {
    const result = await db.order.delete({
      where: {
        orderId,
      },
    });

    if (!result) {
      throw new NotFoundException(
        'Order not exists',
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return result;
  }

  public async findAllByMember({
    page = 1,
    limit = 10,
    search,
    createById,
  }: IPaginationQuery) {
    const query: any = {
      createById: createById,
    };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    if (search) {
      query.OR = [
        // {
        //   name: {
        //     contains: search,
        //     mode: 'insensitive',
        //   },
        // },
        // {
        //   description: {
        //     contains: search,
        //     mode: 'insensitive',
        //   },
        // },
      ];
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where: query,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
      }),
      db.order.count({
        where: query,
      }),
    ]);

    return {
      orders,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  public async midtransWebhook({
    transactionStatus,
    order_id,
    paymentType,
    paymentDate,
  }: {
    transactionStatus: string;
    order_id: string;
    paymentType?: string;
    paymentDate?: string;
  }) {
    console.log({ transactionStatus, order_id, paymentType, paymentDate });
    switch (transactionStatus) {
      case 'capture':
        await this.completed(
          order_id,
          paymentType as string,
          paymentDate as string,
        ); // Ganti 'system' dengan userId yang sesuai jika perlu
        break;
      case 'settlement':
        // Pembayaran berhasil
        await this.completed(
          order_id,
          paymentType as string,
          paymentDate as string,
        ); // Ganti 'system' dengan userId yang sesuai jika perlu
        break;

      case 'cancel':
        await this.cancelled(order_id);
        break;
      case 'deny':
        await this.cancelled(order_id);
        break;
      case 'expire':
        await this.cancelled(order_id);
        break;
      case 'pending':
        break;
    }

    return 'Berhasil memproses webhook Midtrans';
  }

  public async dashboardFindAll({ filter = 'monthly' }: { filter: string }) {
    const now = dayjs();
    let startDate: Date | null = null;

    switch (filter) {
      case 'daily':
        startDate = now.startOf('day').toDate();
        break;
      case 'weekly':
        startDate = now.startOf('week').toDate();
        break;
      case 'monthly':
        startDate = now.startOf('month').toDate();
        break;
      case 'yearly':
        startDate = now.startOf('year').toDate();
        break;
      case 'all':
      default:
        startDate = null;
        break;
    }

    const query: any = {};

    if (startDate) {
      query.createdAt = {
        gte: startDate, // filter dari startDate sampai sekarang
      };
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        // where: query,
        orderBy: { updatedAt: 'desc' },
        include: {
          payment: true,
        },
      }),
      db.order.count({
        where: query,
      }),
    ]);

    return {
      orders,
      total,
    };
  }

  public async dashboardOrderChart() {
    const dashboard = new Dashboard();

    const [
      hourly,
      daily,
      weekly,
      monthly,
      yearly,
      all,
      prevHourly,
      prevDaily,
      prevWeekly,
      prevMonthly,
      prevYearly,
    ] = await Promise.all([
      await dashboard.getOrderSummaryByTime('hourly'),
      await dashboard.getOrderSummaryByTime('daily'),
      await dashboard.getOrderSummaryByTime('weekly'),
      await dashboard.getOrderSummaryByTime('monthly'),
      await dashboard.getOrderSummaryByTime('yearly'),
      await dashboard.getOrderSummaryByTime('all'),
      await dashboard.getOrderSummaryByTime('prevHourly'),
      await dashboard.getOrderSummaryByTime('prevDaily'),
      await dashboard.getOrderSummaryByTime('prevWeekly'),
      await dashboard.getOrderSummaryByTime('prevMonthly'),
      await dashboard.getOrderSummaryByTime('prevYearly'),
    ]);
    return {
      hourly,
      daily,
      weekly,
      monthly,
      yearly,
      all,
      prevHourly,
      prevDaily,
      prevWeekly,
      prevMonthly,
      prevYearly,
    };
  }
}
