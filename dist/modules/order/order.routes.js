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
const client_1 = require("@prisma/client");
const orderRoutes = (0, express_1.Router)();
orderRoutes.post('/orders', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.MEMBER])], 
// [authenticateJWT, aclMiddleware([ROLES.MEMBER])],
order_module_1.oderController.create);
orderRoutes.get('/orders', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.admin])], order_module_1.oderController.findAll);
orderRoutes.get('/orders/:orderId', [
    jwt_strategy_1.authenticateJWT,
    (0, acl_middleware_1.default)([client_1.ROLE_USER.member, client_1.ROLE_USER.company, client_1.ROLE_USER.admin]),
], order_module_1.oderController.findOne);
orderRoutes.get('/orders/member', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.member])], order_module_1.oderController.findAllByMember);
orderRoutes.get('/orders-company', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.company])], order_module_1.oderController.findAllByCompany);
// orderRoutes.put(
//   '/orders/:orderId/completed',
//   oderController.completed,
// );
// orderRoutes.put(
//   '/orders/:orderId/pending',
//   oderController.pending,
// );
// orderRoutes.put(
//   '/orders/:orderId/cancelled',
//   oderController.cancelled,
// );
orderRoutes.delete('/orders/:orderId/remove', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.admin])], order_module_1.oderController.remove);
orderRoutes.get('/orders-history', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.member])], order_module_1.oderController.findAllByMember);
orderRoutes.get('/orders-dashboard', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.admin])], order_module_1.oderController.dashboardFindAll);
orderRoutes.get('/orders-dashboard/chart', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.admin])], order_module_1.oderController.dashboardChart);
orderRoutes.get('/orders-dashboard/chart-company', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.company])], order_module_1.oderController.dashboardChartCompany);
orderRoutes.post('/orders/midtrans', order_module_1.oderController.midtransWebhook);
exports.default = orderRoutes;
