"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwt_strategy_1 = require("../../cummon/strategies/jwt.strategy");
const acl_middleware_1 = __importDefault(require("../../middlewares/acl.middleware"));
const client_1 = require("@prisma/client");
const voucher_module_1 = require("./voucher.module");
const voucherRoutes = (0, express_1.Router)();
voucherRoutes.post('/voucher-scan', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.company_scanner])], voucher_module_1.voucherController.scanVoucher);
voucherRoutes.get('/voucher/:code', [
    jwt_strategy_1.authenticateJWT,
    (0, acl_middleware_1.default)([client_1.ROLE_USER.company_scanner, client_1.ROLE_USER.admin]),
], voucher_module_1.voucherController.findOneByCode);
exports.default = voucherRoutes;
