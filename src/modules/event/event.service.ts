import { ErrorCode } from '../../cummon/enums/error-code.enum';
import {
  ICreateEvent,
  IPaginationQuery,
  IUpdateEvent,
} from '../../cummon/interface/event.interface';
import {
  BadRequestException,
  NotFoundException,
} from '../../cummon/utils/catch-errors';
import slug from '../../cummon/utils/slug';
import uploader from '../../cummon/utils/uploader';
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

    const currentCategoryId = await db.category.findUnique({
      where: { id: body?.categoryId },
    });

    if (!currentCategoryId) {
      throw new NotFoundException(
        'Category not found',
        ErrorCode.RESOURCE_NOT_FOUND,
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

  public async findAll({
    page = 1,
    limit = 10,
    search,
    isPublished,
    isFeatured,
    isOnline,
    category,
    cityName,
  }: IPaginationQuery) {
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
        {
          address: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          category: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          city: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    if (isPublished) {
      query.isPublished = isPublished === 'true';
    }

    if (isOnline) {
      query.isOnline = isOnline === 'true';
    }

    if (isFeatured) {
      query.isFeatured = isFeatured === 'true';
    }

    if (category) {
      query.categoryId = category;
    }

    if (cityName) {
      query.city = {
        name: {
          contains: cityName,
          mode: 'insensitive',
        },
      };
    }

    const [events, total] = await Promise.all([
      db.event.findMany({
        where: query,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          category: true,
          city: true,
          tickets: true,
        },
      }),
      db.event.count({
        where: query,
      }),
    ]);

    // lalu ambil tiket termurah per event
    const result = events.map((event) => {
      const cheapestTicket = event.tickets.reduce(
        (min, curr) => (curr.price < min.price ? curr : min),
        event.tickets[0],
      );

      const totalAudience = event.tickets.reduce(
        (sum, ticket) => sum + ticket.quantity,
        0,
      );

      return {
        ...event,
        cheapestTicket,
        totalAudience,
      };
    });

    return {
      events: result,
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

  public async update(id: string, body: IUpdateEvent) {
    const nameSlug = slug.generate(body?.name as string);
    if (body?.name) {
      const findEvent = await db.event.findFirst({
        where: {
          slug: nameSlug,
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
    }

    // Fetch current event for fallback data
    const currentEvent = await db.event.findUnique({
      where: { id },
    });

    if (!currentEvent) {
      throw new NotFoundException(
        'Category not found',
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    if (body?.categoryId) {
      const currentCatgeoryId = await db.category.findUnique({
        where: { id: body?.categoryId },
      });

      if (!currentCatgeoryId) {
        throw new NotFoundException('Category not found');
      }
    }

    const updatedEvent = await db.event.update({
      where: {
        id,
      },
      data: {
        ...body,
        name: body?.name ? body?.name : currentEvent?.name,
        slug: body?.name ? nameSlug : currentEvent?.slug,
        banner: body?.banner ? body?.banner : currentEvent.banner,
        categoryId: body?.categoryId
          ? body?.categoryId
          : currentEvent.categoryId,
        startDate: body.startDate ? body.startDate : currentEvent?.startDate,
        endDate: body.endDate ? body.endDate : currentEvent?.endDate,
        isFeatured: String(body.isFeatured)
          ? body.isFeatured
          : currentEvent?.isFeatured,
        isOnline: String(body.isOnline)
          ? body.isOnline
          : currentEvent?.isOnline,
        isPublished: String(body.isPublished)
          ? body.isPublished
          : currentEvent?.isPublished,
        description: body.description
          ? body.description
          : currentEvent?.description,
        regionId: body.regionId ? body.regionId : currentEvent?.regionId,
        address: body.address ? body.address : currentEvent?.address,
        latitude: body.latitude ? body.latitude : currentEvent?.latitude,
        longitude: body.longitude ? body.longitude : currentEvent?.longitude,
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

    await uploader.remove(findEvent.banner);

    return findEvent;
  }

  public async findOneBySlug(slug: string) {
    const event = await db.event.findFirst({
      where: {
        slug,
      },
      include: {
        tickets: true,
      },
    });

    const totalAudience = event?.tickets.reduce(
      (sum, ticket) => sum + ticket.quantity,
      0,
    );

    return {
      ...event,
      totalAudience,
    };
  }
}
