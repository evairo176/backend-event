import { Request, Response } from 'express';
import { HTTPSTATUS } from '../../config/http.config';
import { CategoryService } from './category.service';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../../cummon/validators/category.validator';
import { IPaginationQuery } from '../../cummon/interface/category.interface';
import { asyncHandler } from '../../middlewares/async-handler.middleware';

export class CategoryController {
  private categoryService: CategoryService;

  constructor(categoryService: CategoryService) {
    this.categoryService = categoryService;
  }

  public create = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = createCategorySchema.parse({
        ...req?.body,
      });
      const userId = req?.user?.id;

      const result = await this.categoryService.create({
        ...body,
        createById: userId as string,
        updatedById: userId as string,
      });

      return res.status(HTTPSTATUS.CREATED).json({
        message: 'Create category successfully',
        data: result,
      });
    },
  );

  public findAll = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const query = req?.query as unknown as IPaginationQuery;

      const { categories, limit, page, total, totalPages } =
        await this.categoryService.findAll(query);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success find all category',
        data: categories,
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

      const { category } = await this.categoryService.findOne(params.id);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success find one category',
        data: category,
      });
    },
  );

  public update = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = updateCategorySchema.parse({
        ...req?.body,
      });
      const params = req?.params;
      const userId = req?.user?.id;

      const category = await this.categoryService.update(params.id, {
        ...body,
        updatedById: userId as string,
      });

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success update category',
        data: category,
      });
    },
  );

  public remove = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const params = req?.params;

      const category = await this.categoryService.remove(params.id);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success delete category',
        data: category,
      });
    },
  );
}
