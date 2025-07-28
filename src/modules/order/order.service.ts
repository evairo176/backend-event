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

export class OrderService {
  public async create(orderData: orderItemDto[], userData: CreateOrderDto) {
    return await db.$transaction(async (tx) => {
      const results = [];

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

        const orderId = await generateOrderId();
        const total: number = +existingTicket.price * +body.quantity;

        // Midtrans request tetap di luar transaksi DB
        const paymentMidtrans = new PaymentMidtrans();
        const generatePayment = await paymentMidtrans.createLink({
          transaction_details: {
            gross_amount: total,
            order_id: orderId,
          },
        });

        const payment = await tx.payment.create({
          data: {
            token: generatePayment.token,
            redirect_url: generatePayment.redirect_url,
          },
        });

        const createdOrder = await tx.order.create({
          data: {
            ...body,
            orderId,
            total,
            paymentId: payment.id,
            createById: userData?.createById,
            updatedById: userData?.createById,
          },
        });

        const result = await tx.order.findFirst({
          where: { id: createdOrder.id },
          include: {
            event: true,
            ticket: true,
            payment: true,
            vouchers: true,
          },
        });

        results.push(result);
      }

      return results;
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

  public async completed(orderId: string, userId: string) {
    const order = await db.order.findFirst({
      where: {
        orderId,
        createById: userId,
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

    const ticket = await db.ticket.findFirst({
      where: {
        id: order.ticketId,
      },
    });

    if (!ticket) {
      throw new NotFoundException(
        'Ticket on not exists this order',
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    const vouchers = Array.from({ length: order.quantity }).map(() => ({
      isPrint: false,
      voucherId: nanoid(21),
      orderId: order.id,
      createById: userId,
    }));

    // ✅ Execute all DB operations in a transaction
    const [createdVouchers, updatedOrder, updatedTicket] =
      await db.$transaction([
        db.voucher.createMany({
          data: vouchers,
        }),
        db.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: 'COMPLETED',
          },
        }),
        db.ticket.update({
          where: {
            id: ticket.id,
          },
          data: {
            quantity: ticket.quantity - order.quantity,
          },
        }),
      ]);

    return {
      vouchers: createdVouchers,
      order: updatedOrder,
      ticket: updatedTicket,
    };
  }
  public async pending(orderId: string, userId: string) {
    const order = await db.order.findFirst({
      where: {
        orderId,
        createById: userId,
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
  public async cancelled(orderId: string, userId: string) {
    const order = await db.order.findFirst({
      where: {
        orderId,
        createById: userId,
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
}
