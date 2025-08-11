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
const mask_code_1 = require("../../cummon/utils/mask-code");
const database_1 = require("../../database/database");
class VoucherService {
    scanVoucher(_a) {
        return __awaiter(this, arguments, void 0, function* ({ code, scannedById, device, location, companyId, }) {
            return database_1.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                // Cari voucher
                const voucher = yield tx.voucherTicket.findUnique({
                    where: { code: code },
                    include: {
                        ticket: {
                            include: {
                                event: {
                                    include: {
                                        createdBy: true,
                                    },
                                },
                            },
                        },
                    },
                });
                if (!voucher) {
                    yield (0, log_scan_voucher_1.logScanTx)(database_1.db, null, scannedById, 'FAILED', 'Voucher tidak ditemukan', location, device);
                    throw new catch_errors_1.BadRequestException('Voucher not exists', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
                }
                if (((_c = (_b = (_a = voucher === null || voucher === void 0 ? void 0 : voucher.ticket) === null || _a === void 0 ? void 0 : _a.event) === null || _b === void 0 ? void 0 : _b.createdBy) === null || _c === void 0 ? void 0 : _c.companyId) !== companyId) {
                    yield (0, log_scan_voucher_1.logScanTx)(database_1.db, voucher.id, scannedById, 'FAILED', 'Voucher ini tidak termasuk di dalam event anda', location, device);
                    throw new catch_errors_1.BadRequestException('Voucher ini tidak termasuk di dalam event anda', "VERIFICATION_ERROR" /* ErrorCode.VERIFICATION_ERROR */);
                }
                if (voucher.isUsed) {
                    yield (0, log_scan_voucher_1.logScanTx)(database_1.db, voucher.id, scannedById, 'FAILED', 'Voucher sudah digunakan', location, device);
                    throw new catch_errors_1.BadRequestException('Voucher sudah digunakan', "VERIFICATION_ERROR" /* ErrorCode.VERIFICATION_ERROR */);
                }
                // Tandai voucher sebagai digunakan
                yield tx.voucherTicket.update({
                    where: { id: voucher.id },
                    data: { isUsed: true },
                });
                // Simpan riwayat scan sukses
                yield (0, log_scan_voucher_1.logScanTx)(database_1.db, voucher.id, scannedById, 'SUCCESS', 'Voucher valid', location, device);
                return {
                    message: `Voucher valid untuk tiket: ${(_d = voucher.ticket) === null || _d === void 0 ? void 0 : _d.name}`,
                };
            }));
        });
    }
    findOneByCode(code, scannedById) {
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
                yield (0, log_scan_voucher_1.logScanTx)(database_1.db, null, scannedById, 'FAILED', 'Voucher tidak ditemukan', '', '');
                return {
                    success: false,
                    message: 'Voucher tidak ditemukan',
                    data: null,
                };
            }
            if (voucher.isUsed) {
                yield (0, log_scan_voucher_1.logScanTx)(database_1.db, voucher.id, scannedById, 'FAILED', 'Voucher sudah digunakan', '', '');
                return {
                    success: false,
                    message: 'Voucher sudah digunakan',
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Voucher valid',
                data: voucher,
            };
        });
    }
    findAllByUserId(_a) {
        return __awaiter(this, arguments, void 0, function* ({ page = 1, limit = 10, search, userId, }) {
            const query = {
                scannedById: userId,
            };
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            if (search === null || search === void 0 ? void 0 : search.trim()) {
                const s = search.trim();
                query.OR = [
                    // note pada history
                    { note: { contains: s, mode: 'insensitive' } },
                    // nama ticket
                    {
                        voucher: {
                            is: {
                                ticket: {
                                    is: {
                                        name: { contains: s, mode: 'insensitive' },
                                    },
                                },
                            },
                        },
                    },
                    // nama event
                    {
                        voucher: {
                            is: {
                                ticket: {
                                    is: {
                                        event: {
                                            is: {
                                                name: { contains: s, mode: 'insensitive' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                ];
            }
            const [scanHistories, total] = yield Promise.all([
                database_1.db.ticketScanHistory.findMany({
                    where: query,
                    skip,
                    take,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        voucher: {
                            include: {
                                ticket: {
                                    include: {
                                        event: true,
                                    },
                                },
                            },
                        },
                    },
                }),
                database_1.db.ticketScanHistory.count({
                    where: query,
                }),
            ]);
            // bikin field baru `codeMasked` (biar code asli tetap ada)
            const result = scanHistories.map((r) => (Object.assign(Object.assign({}, r), { voucher: r.voucher
                    ? Object.assign(Object.assign({}, r.voucher), { code: (0, mask_code_1.maskCode)(r.voucher.code) }) : null })));
            return {
                scanHistories: result,
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            };
        });
    }
}
exports.VoucherService = VoucherService;
