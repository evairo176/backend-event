import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';

const voucherService = new VoucherService();
const voucherController = new VoucherController(voucherService);

export { voucherService, voucherController };
