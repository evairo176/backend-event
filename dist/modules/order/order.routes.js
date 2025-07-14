"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwt_strategy_1 = require("../../cummon/strategies/jwt.strategy");
const role_enum_1 = require("../../cummon/enums/role.enum");
const acl_middleware_1 = __importDefault(require("../../middlewares/acl.middleware"));
const order_module_1 = require("./order.module");
const orderRoutes = (0, express_1.Router)();
orderRoutes.post('/order', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.MEMBER, role_enum_1.ROLES.ADMIN, role_enum_1.ROLES.MANAGER])], order_module_1.oderController.create);
orderRoutes.get('/order', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.ADMIN, role_enum_1.ROLES.MANAGER])], order_module_1.oderController.findAll);
exports.default = orderRoutes;
