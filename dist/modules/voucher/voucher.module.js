"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voucherController = exports.voucherService = void 0;
const voucher_controller_1 = require("./voucher.controller");
const voucher_service_1 = require("./voucher.service");
const voucherService = new voucher_service_1.VoucherService();
exports.voucherService = voucherService;
const voucherController = new voucher_controller_1.VoucherController(voucherService);
exports.voucherController = voucherController;
