import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.middleware';
import { BannerService } from './banner.service';
import { HTTPSTATUS } from '../../config/http.config';
import {
  createBannerSchema,
  updateBannerSchema,
} from '../../cummon/validators/banner.validator';
import { IPaginationQuery } from '../../cummon/interface/banner.interface';

export class BannerController {
  private bannerService: BannerService;

  constructor(bannerService: BannerService) {
    this.bannerService = bannerService;
  }

  public create = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = createBannerSchema.parse({
        ...req?.body,
      });
      const userId = req?.user?.id;

      const result = await this.bannerService.create({
        ...body,
        createById: userId as string,
        updatedById: userId as string,
      });

      return res.status(HTTPSTATUS.CREATED).json({
        message: 'Create banner successfully',
        data: result,
      });
    },
  );

  public findAll = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const query = req?.query as unknown as IPaginationQuery;

      const { banners, limit, page, total, totalPages } =
        await this.bannerService.findAll(query);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success find all banner',
        data: banners,
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

      const { banner } = await this.bannerService.findOne(params.id);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success find one banner',
        data: banner,
      });
    },
  );

  public update = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = updateBannerSchema.parse({
        ...req?.body,
      });
      const params = req?.params;
      const userId = req?.user?.id;
      const banner = await this.bannerService.update(params.id, {
        ...body,
        updatedById: userId as string,
      });
      return res.status(HTTPSTATUS.OK).json({
        message: 'Success update banner',
        data: banner,
      });
    },
  );

  public remove = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const params = req?.params;
      const banner = await this.bannerService.remove(params.id);
      return res.status(HTTPSTATUS.OK).json({
        message: 'Success delete banner',
        data: banner,
      });
    },
  );
}
