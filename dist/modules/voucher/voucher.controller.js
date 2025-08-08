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
exports.VoucherController = void 0;
const async_handler_middleware_1 = require("../../middlewares/async-handler.middleware");
const http_config_1 = require("../../config/http.config");
const voucher_validator_1 = require("../../cummon/validators/voucher.validator");
class VoucherController {
    constructor(voucherService) {
        this.scanVoucher = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const body = voucher_validator_1.scanVoucherSchema.parse(Object.assign({}, req === null || req === void 0 ? void 0 : req.body));
            const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { message } = yield this.voucherService.scanVoucher(Object.assign(Object.assign({}, body), { scannedById: userId }));
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: message,
            });
        }));
        this.findOneByCode = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const params = req === null || req === void 0 ? void 0 : req.params;
            const result = yield this.voucherService.findOneByCode(params === null || params === void 0 ? void 0 : params.code);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: `Success find one voucher`,
                data: result,
            });
        }));
        this.voucherService = voucherService;
    }
}
exports.VoucherController = VoucherController;
