"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoucherService = void 0;
const catch_errors_1 = require("../../cummon/utils/catch-errors");
const log_scan_voucher_1 = require("../../cummon/utils/log-scan-voucher");
const database_1 = require("../../database/database");
class VoucherService {
    scanVoucher(_a) {
        return __awaiter(this, arguments, void 0, function* ({ code, scannedById, device, location, }) {
            return database_1.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                // Cari voucher
                const voucher = yield tx.voucherTicket.findUnique({
                    where: { code: code },
                    include: { ticket: true },
                });
                if (!voucher) {
                    yield (0, log_scan_voucher_1.logScanTx)(tx, null, scannedById, 'FAILED', 'Voucher tidak ditemukan', location, device);
                    throw new catch_errors_1.BadRequestException('Voucher not exists', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
                }
                if (voucher.isUsed) {
                    yield (0, log_scan_voucher_1.logScanTx)(tx, voucher.id, scannedById, 'FAILED', 'Voucher sudah digunakan', location, device);
                    throw new catch_errors_1.BadRequestException('Voucher sudah digunakan', "VERIFICATION_ERROR" /* ErrorCode.VERIFICATION_ERROR */);
                }
                // Tandai voucher sebagai digunakan
                yield tx.voucherTicket.update({
                    where: { id: voucher.id },
                    data: { isUsed: true },
                });
                // Simpan riwayat scan sukses
                yield (0, log_scan_voucher_1.logScanTx)(tx, voucher.id, scannedById, 'SUCCESS', 'Voucher valid', location, device);
                return {
                    message: `Voucher valid untuk tiket: ${(_a = voucher.ticket) === null || _a === void 0 ? void 0 : _a.name}`,
                };
            }));
        });
    }
    findOneByCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const voucher = yield database_1.db.voucherTicket.findFirst({
                where: {
                    code,
                },
                include: {
                    ticket: {
                        include: {
                            event: true,
                        },
                    },
                },
            });
            if (!voucher) {
                throw new catch_errors_1.BadRequestException('Voucher not exists', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
            }
            if (voucher.isUsed) {
                throw new catch_errors_1.BadRequestException('Voucher sudah digunakan', "VERIFICATION_ERROR" /* ErrorCode.VERIFICATION_ERROR */);
            }
            return voucher;
        });
    }
}
exports.VoucherService = VoucherService;
