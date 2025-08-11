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
    // (opsional) naikin isolation level kalau DB mendukung
    return await db.$transaction(
      async (tx) => {
        // 1) Validasi event awal (tetap)
        const eventId = orderData[0].eventId;
        const checkExistingEvent = await tx.event.findFirst({
          where: { id: eventId },
          include: { createdBy: { include: { company: true } } },
        });
        if (!checkExistingEvent) {
          throw new BadRequestException(
            'Event not exists',
            ErrorCode.RESOURCE_NOT_FOUND,
          );
        }

        // 2) Agregasi qty per ticketId (kalau ada duplikat item, dijumlah)
        const qtyByTicket: Record<string, number> = {};
        for (const it of orderData) {
          qtyByTicket[it.ticketId] =
            (qtyByTicket[it.ticketId] ?? 0) + Number(it.quantity || 0);
        }
        const ticketIds = Object.keys(qtyByTicket);

        // 3) Ambil tiketnya sekali (untuk harga & validasi)
        const tickets = await tx.ticket.findMany({
          where: { id: { in: ticketIds } },
          include: { event: true },
        });
        if (tickets.length !== ticketIds.length) {
          throw new BadRequestException(
            'Ticket not exists',
            ErrorCode.RESOURCE_NOT_FOUND,
          );
        }

        // (opsional) pastikan semua ticket memang milik event terkait
        // if (!tickets.every(t => t.eventId === eventId)) {
        //   throw new BadRequestException('Semua tiket harus dari event yang sama');
        // }

        // 4) Hitung total dari harga tiket x qty
        let total = 0;
        for (const t of tickets) {
          total += Number(t.price) * qtyByTicket[t.id];
        }

        // 5) ATOMIC: kurangi stok tiap tiket
        //    Pakai updateMany + guard quantity >= need agar aman dari race condition.
        for (const t of tickets) {
          const need = qtyByTicket[t.id];
          const res = await tx.ticket.updateMany({
            where: { id: t.id, quantity: { gte: need } },
            data: { quantity: { decrement: need } },
          });
          if (res.count === 0) {
            // kalau gagal, transaksi otomatis rollback -> stok tidak berubah
            throw new BadRequestException(
              `Ticket "${t.name}" stok tidak cukup`,
            );
          }
        }

        // 6) Buat orderId
        const orderId = await generateOrderId();

        // 7) (Disarankan) panggil Midtrans SETELAH stok di-reserve,
        //    supaya tidak buat link pembayaran kalau stok habis.
        const paymentMidtrans = new PaymentMidtrans();
        const generatePayment = await paymentMidtrans.createLink({
          transaction_details: { gross_amount: total, order_id: orderId },
        });

        // 8) Simpan payment
        const payment = await tx.payment.create({
          data: {
            token: generatePayment.token,
            redirect_url: generatePayment.redirect_url,
          },
        });

        // 9) Simpan order
        const createdOrder = await tx.order.create({
          data: {
            orderId,
            total,
            paymentId: payment.id,
            createById: userData?.createById,
            updatedById: userData?.createById,
            companyId: checkExistingEvent.createdBy?.companyId,
          },
        });

        // 10) Simpan order items
        for (const body of orderData) {
          const ticket = tickets.find((t) => t.id === body.ticketId)!;
          await tx.orderItem.create({
            data: {
              orderId: createdOrder.id,
              eventId: body.eventId,
              ticketId: body.ticketId,
              quantity: body.quantity,
              price: ticket.price,
            },
          });
        }

        // 11) Return hasil lengkap
        const result = await tx.order.findFirst({
          where: { id: createdOrder.id },
          include: {
            items: { include: { event: true, ticket: true } },
            payment: true,
          },
        });

        return result!;
      } /*, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable // opsional
  }*/,
    );
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
                vouchers: {
                  where: {
                    orderId,
                  },
                  include: {
                    ticketScanHistory: {
                      where: { status: 'SUCCESS' },
                      take: 1,
                      orderBy: { createdAt: 'desc' },
                    },
                  },
                },
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
        items: {
          include: {
            event: {
              include: {
                createdBy: true,
              },
            },
          },
        },
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
        orderId,
      }));

      // ✅ Execute all DB operations in a transaction
      const [createdVouchers, updatedOrder] = await db.$transaction([
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
      ]);
      result.push({
        createdVouchers,
        updatedOrder,
      });
    }

    const owner = await db.user.findFirst({
      where: {
        companyId: order.companyId,
        role: 'company_owner',
      },
    });

    if (owner && order.total > 0) {
      await db.$transaction([
        db.user.update({
          where: { id: owner.id },
          data: {
            balance: owner.balance + order.total,
          },
        }),
        db.balanceTransaction.create({
          data: {
            userId: owner.id,
            amount: order.total,
            type: 'IN',
            description: `Pemasukan dari order ${order.orderId}`,
            referenceId: order.id,
          },
        }),
      ]);
    }

    return result;
  }

  public async cancelled(orderId: string, userId?: string) {
    return db.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { orderId },
        include: { items: true },
      });
      if (!order)
        throw new NotFoundException(
          'Order not exists',
          ErrorCode.RESOURCE_NOT_FOUND,
        );
      if (order.status === 'COMPLETED')
        throw new BadRequestException('You have been completed this order');
      if (order.status === 'CANCELLED')
        throw new BadRequestException('This order is already cancelled');

      // Guard: pastikan hanya status tertentu yang bisa di-cancel (anti race)
      const updated = await tx.order.updateMany({
        where: {
          id: order.id,
          status: { in: ['PENDING', 'CANCELLED', 'COMPLETED'] },
        },
        data: {
          status: 'CANCELLED',
          updatedById: userId,
          cancelledAt: new Date() as any,
        },
      });
      if (updated.count === 0) {
        throw new BadRequestException(
          'Order cannot be cancelled from current status',
        );
      }

      // Hitung qty per tiket
      const incByTicket: Record<string, number> = {};
      for (const it of order.items) {
        incByTicket[it.ticketId] =
          (incByTicket[it.ticketId] ?? 0) + Number(it.quantity);
      }

      // Kembalikan stok
      for (const [ticketId, inc] of Object.entries(incByTicket)) {
        await tx.ticket.update({
          where: { id: ticketId },
          data: { quantity: { increment: inc } },
        });
      }

      // Return order terbaru
      return tx.order.findFirst({
        where: { id: order.id },
        include: { items: true },
      });
    });
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

  public async findAllByCompany({
    page = 1,
    limit = 10,
    search,
    companyId,
  }: IPaginationQuery) {
    const query: any = {
      companyId: companyId,
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
        include: {
          createdBy: {
            select: {
              fullname: true,
              email: true,
              company: true,
            },
          },
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

  public async dashboardOrderChartCompany({
    companyId,
  }: {
    companyId: string;
  }) {
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
      await dashboard.getOrderSummaryByTimeCompany('hourly', companyId),
      await dashboard.getOrderSummaryByTimeCompany('daily', companyId),
      await dashboard.getOrderSummaryByTimeCompany('weekly', companyId),
      await dashboard.getOrderSummaryByTimeCompany('monthly', companyId),
      await dashboard.getOrderSummaryByTimeCompany('yearly', companyId),
      await dashboard.getOrderSummaryByTimeCompany('all', companyId),
      await dashboard.getOrderSummaryByTimeCompany('prevHourly', companyId),
      await dashboard.getOrderSummaryByTimeCompany('prevDaily', companyId),
      await dashboard.getOrderSummaryByTimeCompany('prevWeekly', companyId),
      await dashboard.getOrderSummaryByTimeCompany('prevMonthly', companyId),
      await dashboard.getOrderSummaryByTimeCompany('prevYearly', companyId),
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
