import { ErrorCode } from '../../cummon/enums/error-code.enum';
import { CreateOrderDto } from '../../cummon/interface/order.interface';
import { BadRequestException } from '../../cummon/utils/catch-errors';
import { PaymentMidtrans } from '../../cummon/utils/payment';
import { db } from '../../database/database';

export class OrderService {
  public async create(body: CreateOrderDto) {
    return await db.$transaction(async (tx) => {
      const existingTicket = await tx.ticket.findFirst({
        where: {
          id: body?.ticketId,
        },
      });

      if (!existingTicket) {
        throw new BadRequestException(
          'Ticket not exists',
          ErrorCode.RESOURCE_NOT_FOUND,
        );
      }

      const existingEvent = await tx.event.findFirst({
        where: {
          id: body?.eventId,
        },
      });

      if (!existingEvent) {
        throw new BadRequestException(
          'Event not exists',
          ErrorCode.RESOURCE_NOT_FOUND,
        );
      }

      if (existingTicket.quantity < body?.quantity) {
        throw new BadRequestException(
          'Ticket quantity is not enough',
          ErrorCode.RESOURCE_NOT_FOUND,
        );
      }

      const total: number = +existingTicket.price * +body?.quantity;

      // Midtrans di luar transaction karena bukan bagian dari DB
      const paymentMidtrans = new PaymentMidtrans();
      const generatePayment = await paymentMidtrans.createLink({
        transaction_details: {
          gross_amount: total,
          order_id: body?.orderId,
        },
      });

      // Simpan payment ke DB (masuk dalam transaction)
      const payment = await tx.payment.create({
        data: {
          token: generatePayment.token,
          redirect_url: generatePayment.redirect_url, // typo? rediredUrl -> redirect_url
        },
      });

      const createOrder = await tx.order.create({
        data: {
          ...body,
          total,
          paymentId: payment.id,
        },
      });

      const result = await tx.order.findFirst({
        where: {
          id: createOrder.id,
        },
        include: {
          event: true,
          ticket: true,
          payment: true,
          vouchers: true,
        },
      });

      return result;
    });
  }
  public async findAll() {}
  public async findOne() {}
  public async findAllByMember() {}
  public async completed() {}
  public async pending() {}
  public async cancelled() {}
}
