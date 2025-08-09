import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.middleware';
import { VoucherService } from './voucher.service';
import { HTTPSTATUS } from '../../config/http.config';
import { scanVoucherSchema } from '../../cummon/validators/voucher.validator';

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

      const result = await this.voucherService.findOneByCode(params?.code);

      return res.status(HTTPSTATUS.OK).json({
        ...result,
      });
    },
  );
}
