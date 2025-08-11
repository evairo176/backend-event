import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.middleware';
import { VoucherService } from './voucher.service';
import { HTTPSTATUS } from '../../config/http.config';
import { scanVoucherSchema } from '../../cummon/validators/voucher.validator';
import { IPaginationQuery } from '../../cummon/interface/voucher.interface';

export class VoucherController {
  private voucherService: VoucherService;

  constructor(voucherService: VoucherService) {
    this.voucherService = voucherService;
  }

  public scanVoucher = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = scanVoucherSchema.parse({
        ...req?.body,
      });
      const userId = req?.user?.id;
      const companyId = req?.user?.companyId;

      const { message } = await this.voucherService.scanVoucher({
        ...body,
        scannedById: userId as string,
        companyId: companyId as string,
      });

      return res.status(HTTPSTATUS.OK).json({
        message: message,
      });
    },
  );

  public findOneByCode = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const params = req?.params;
      const userId = req?.user?.id;

      const result = await this.voucherService.findOneByCode(
        params?.code,
        userId as string,
      );

      return res.status(HTTPSTATUS.OK).json({
        ...result,
      });
    },
  );

  public findAllByUserId = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const query = req?.query as unknown as IPaginationQuery;

      const userId = req?.user?.id;

      const { scanHistories, limit, page, total, totalPages } =
        await this.voucherService.findAllByUserId({
          ...query,
          userId: userId as string,
        });

      return res.status(HTTPSTATUS.OK).json({
        message: 'find all scan history successfully',
        data: scanHistories,
        pagination: {
          limit,
          page,
          total,
          totalPages,
        },
      });
    },
  );
}
