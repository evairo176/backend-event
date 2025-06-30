import { ErrorCode } from '../../cummon/enums/error-code.enum';
import { IPaginationQuery } from '../../cummon/interface/category.interface';
import { ICreateEvent } from '../../cummon/interface/event.interface';
import { BadRequestException } from '../../cummon/utils/catch-errors';
import slug from '../../cummon/utils/slug';
import { db } from '../../database/database';

export default class EventService {
  public async create(body: ICreateEvent) {
    const nameSlug = slug.generate(body.name);

    const findEvent = await db.event.findFirst({
      where: {
        slug: nameSlug,
      },
    });

    if (findEvent) {
      throw new BadRequestException(
        'Event already exists with this name',
        ErrorCode.EVENT_NAME_ALREADY_EXISTS,
      );
    }

    const result = await db.event.create({
      data: {
        ...body,
        slug: nameSlug,
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

    const [events, total] = await Promise.all([
      db.event.findMany({
        where: query,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
      }),
      db.event.count({
        where: query,
      }),
    ]);

    return {
      events,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  public async findOne(id: string) {
    const result = await db.event.findFirst({
      where: {
        id,
      },
    });

    return result;
  }

  public async update(id: string, body: ICreateEvent) {
    const nameSlug = slug.generate(body?.name);
    const findEvent = await db.event.findFirst({
      where: {
        name: nameSlug,
        NOT: {
          id: id,
        },
      },
    });

    if (findEvent) {
      throw new BadRequestException(
        'Event already exists with this name',
        ErrorCode.EVENT_NAME_ALREADY_EXISTS,
      );
    }

    const updatedEvent = await db.event.update({
      where: {
        id,
      },
      data: {
        ...body,
        slug: nameSlug,
      },
    });

    return updatedEvent;
  }

  public async remove(id: string) {
    // Cari kategori dengan nama yang sama, tapi berbeda ID
    const findEvent = await db.event.findFirst({
      where: {
        id,
      },
    });

    if (!findEvent) {
      throw new BadRequestException(
        'Event not exists',
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    await db.event.delete({
      where: {
        id: findEvent.id,
      },
    });

    return findEvent;
  }

  public async findOneBySlug(slug: string) {
    const result = await db.event.findFirst({
      where: {
        slug,
      },
    });

    return result;
  }
}
