import { ErrorCode } from '../../cummon/enums/error-code.enum';
import { IPaginationQuery } from '../../cummon/interface/category.interface';
import {
  ICreateTicket,
  IUpdateTicket,
} from '../../cummon/interface/ticket.interface';
import {
  BadRequestException,
  NotFoundException,
} from '../../cummon/utils/catch-errors';
import { db } from '../../database/database';

export class TicketService {
  public async create(body: ICreateTicket) {
    const findTicket = await db.ticket.findFirst({
      where: {
        name: body?.name,
        eventId: body?.eventId,
      },
    });

    if (findTicket) {
      throw new BadRequestException(
        'Ticket already exists with this name & event',
        ErrorCode.TICKET_NAME_ALREADY_EXISTS,
      );
    }

    const currentEventId = await db.event.findUnique({
      where: { id: body?.eventId },
    });

    if (!currentEventId) {
      throw new NotFoundException(
        'Event not found',
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    const result = await db.ticket.create({
      data: {
        ...body,
      },
    });

    return result;
  }
  public async findAll({ page = 1, limit = 10, search }: IPaginationQuery) {
    const query: any = {};

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    if (search) {
      query.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [tickets, total] = await Promise.all([
      db.ticket.findMany({
        where: query,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
      }),
      db.ticket.count({
        where: query,
      }),
    ]);

    return {
      tickets,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    };
  }
  public async findOne(id: string) {
    const result = await db.ticket.findFirst({
      where: {
        id,
      },
    });

    return result;
  }
  public async update(id: string, body: IUpdateTicket) {
    if (body?.name) {
      const findTicket = await db.ticket.findFirst({
        where: {
          name: body?.name,
          eventId: body?.eventId,
          NOT: {
            id: id,
          },
        },
      });

      if (findTicket) {
        throw new BadRequestException(
          'Ticket already exists with this name & event',
          ErrorCode.TICKET_NAME_ALREADY_EXISTS,
        );
      }
    }

    // Fetch current ticket for fallback data
    const currentTicket = await db.ticket.findUnique({
      where: { id },
    });

    if (!currentTicket) {
      throw new NotFoundException(
        'Ticket not found',
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    if (body?.eventId) {
      const currentEventId = await db.event.findUnique({
        where: { id: body?.eventId },
      });

      if (!currentEventId) {
        throw new NotFoundException(
          'Event not found',
          ErrorCode.RESOURCE_NOT_FOUND,
        );
      }
    }

    const updatedTicket = await db.ticket.update({
      where: {
        id,
      },
      data: {
        name: body?.name ? body?.name : currentTicket?.name,
        price: body?.price ? body?.price : currentTicket?.price,
        quantity: body?.quantity ? body?.quantity : currentTicket?.quantity,
        description: body?.description
          ? body?.description
          : currentTicket?.description,
        updatedById: body?.updatedById
          ? body?.updatedById
          : currentTicket?.updatedById,
      },
    });

    return updatedTicket;
  }
  public async remove(id: string) {
    const findTicket = await db.ticket.findFirst({
      where: {
        id,
      },
    });

    if (!findTicket) {
      throw new BadRequestException(
        'Ticket not exists',
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    await db.ticket.delete({
      where: {
        id: findTicket.id,
      },
    });

    return findTicket;
  }
  public async findAllByEvent(
    eventId: string,
    { page = 1, limit = 10, search }: IPaginationQuery,
  ) {
    const where: any = {
      AND: [
        { eventId }, // filter wajib
      ],
    };

    if (search) {
      where.AND.push({
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [tickets, total] = await Promise.all([
      db.ticket.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
      }),
      db.ticket.count({
        where,
      }),
    ]);

    return {
      tickets,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    };
  }
}
