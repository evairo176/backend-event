import { ErrorCode } from '../../cummon/enums/error-code.enum';
import {
  CreateBannerDto,
  UpdateBannerDto,
  IPaginationQuery,
} from '../../cummon/interface/category.interface';
import { BadRequestException } from '../../cummon/utils/catch-errors';
import uploader from '../../cummon/utils/uploader';
import { db } from '../../database/database';

export class CategoryService {
  public async create({
    name,
    description,
    icon,
    createById,
    updatedById,
  }: CreateBannerDto) {
    const findCategory = await db.category.findFirst({
      where: {
        name: name,
      },
    });
    if (findCategory) {
      throw new BadRequestException(
        'Category already exists with this name',
        ErrorCode.CATEGORY_NAME_ALREADY_EXISTS,
      );
    }

    const category = await db.category.create({
      data: {
        name,
        description,
        icon,
        createById,
        updatedById,
      },
    });

    return category;
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

    const [categories, total] = await Promise.all([
      db.category.findMany({
        where: query,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
      }),
      db.category.count({
        where: query,
      }),
    ]);

    return {
      categories,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  public async findOne(id: string) {
    const category = await db.category.findFirst({
      where: {
        id,
      },
    });
    return {
      category,
    };
  }

  public async update(
    id: string,
    { name, description, icon, updatedById }: UpdateBannerDto,
  ) {
    if (name) {
      // Cari kategori dengan nama yang sama, tapi berbeda ID
      const findCategory = await db.category.findFirst({
        where: {
          name: name,
          NOT: {
            id: id,
          },
        },
      });

      if (findCategory) {
        throw new BadRequestException(
          'Category already exists with this name',
          ErrorCode.CATEGORY_NAME_ALREADY_EXISTS,
        );
      }
    }

    const categoryExisting = await db.category.findFirst({
      where: { id },
    });

    // Lakukan update
    const category = await db.category.update({
      where: { id },
      data: {
        name: name ? name : categoryExisting?.name,
        description: description ? description : categoryExisting?.description,
        icon: icon ? icon : categoryExisting?.icon,
        updatedById,
      },
    });

    return category;
  }

  public async remove(id: string) {
    // Cari kategori dengan nama yang sama, tapi berbeda ID
    const findCategory = await db.category.findFirst({
      where: {
        id,
      },
    });

    if (!findCategory) {
      throw new BadRequestException(
        'Category not exists',
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    await db.category.delete({
      where: {
        id: findCategory.id,
      },
    });

    return findCategory;
  }
}
