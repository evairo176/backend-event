import { Request, Response } from 'express';
import RegionService from './region.service';
import { HTTPSTATUS } from '../../config/http.config';
import { asyncHandler } from '../../middlewares/async-handler.middleware';

export default class RegionController {
  private regionService: RegionService;

  constructor(regionService: RegionService) {
    this.regionService = regionService;
  }

  public findByCity = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const query = req.query;

      const result = await this.regionService.findByCity(query?.name as string);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success get region by city name',
        data: result,
      });
    },
  );

  public getAllProvinces = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const result = await this.regionService.getAllProvinces();

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success get all provinces',
        data: result,
      });
    },
  );

  public getProvince = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const params = req.params;
      const result = await this.regionService.getProvince(
        params?.code as string,
      );

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success get a province',
        data: result,
      });
    },
  );

  public getRegency = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const params = req.params;

      const result = await this.regionService.getRegency(params?.id as string);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success get regencies',
        data: result,
      });
    },
  );

  public getDistrict = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const params = req.params;
      const result = await this.regionService.getDistrict(params?.id as string);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success get districts',
        data: result,
      });
    },
  );

  public getVillage = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const params = req.params;
      const result = await this.regionService.getVillage(params?.id as string);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success get villages',
        data: result,
      });
    },
  );
}
