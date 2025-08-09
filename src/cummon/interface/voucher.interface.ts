import { z } from 'zod';
import { scanVoucherSchema } from '../validators/voucher.validator';

export interface IScanVoucher extends z.infer<typeof scanVoucherSchema> {
  createdBy?: string;
  scannedById: string;
  companyId: string;
}
