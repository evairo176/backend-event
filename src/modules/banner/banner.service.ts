import { ErrorCode } from '../../cummon/enums/error-code.enum';
import {
  CreateBannerDto,
  IPaginationQuery,
  UpdateBannerDto,
} from '../../cummon/interface/banner.interface';
import { BadRequestException } from '../../cummon/utils/catch-errors';
import { db } from '../../database/database';

export class BannerService {
  public async create(body: CreateBannerDto) {
    const findBanner = await db.banner.findFirst({
      where: {
        title: body?.title,
      },
    });
    if (findBanner) {
      throw new BadRequestException(
        'Banner already exists with this name',
        ErrorCode.BANNER_NAME_ALREADY_EXISTS,
      );
    }

    const banner = await db.banner.create({
      data: {
        ...body,
      },
    });

    return banner;
  }
  public async findAll({ page = 1, limit = 10, search }: IPaginationQuery) {
    const query: any = {};

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    if (search) {
      query.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [banners, total] = await Promise.all([
      db.banner.findMany({
        where: query,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
      }),
      db.banner.count({
        where: query,
      }),
    ]);

    return {
      banners,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    };
  }
  public async findOne(id: string) {
    const banner = await db.banner.findFirst({
      where: {
        id,
      },
    });
    return {
      banner,
    };
  }
  public async update(id: string, body: UpdateBannerDto) {
    if (body?.title) {
      // Cari kategori dengan nama yang sama, tapi berbeda ID
      const findBanner = await db.banner.findFirst({
        where: {
          title: body?.title,
          NOT: {
            id: id,
          },
        },
      });

      if (findBanner) {
        throw new BadRequestException(
          'Banner already exists with this name',
          ErrorCode.BANNER_NAME_ALREADY_EXISTS,
        );
      }
    }

    const bannerExisting = await db.banner.findFirst({
      where: { id },
    });

    // Lakukan update
    const banner = await db.banner.update({
      where: { id },
      data: {
        title: body?.title ? body?.title : bannerExisting?.title,
        image: body?.image ? body?.image : bannerExisting?.image,
        isShow: body?.isShow ? body?.isShow : bannerExisting?.isShow,
      },
    });

    return banner;
  }
  public async remove(id: string) {
    // Cari kategori dengan nama yang sama, tapi berbeda ID
    const findBanner = await db.banner.findFirst({
      where: {
        id,
      },
    });

    if (!findBanner) {
      throw new BadRequestException(
        'Banner not exists',
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    await db.banner.delete({
      where: {
        id: findBanner.id,
      },
    });

    return findBanner;
  }
}
