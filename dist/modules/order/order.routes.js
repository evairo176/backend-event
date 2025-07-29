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
orderRoutes.post('/orders', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.MEMBER, role_enum_1.ROLES.ADMIN, role_enum_1.ROLES.MANAGER])], 
// [authenticateJWT, aclMiddleware([ROLES.MEMBER])],
order_module_1.oderController.create);
orderRoutes.get('/orders', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.ADMIN, role_enum_1.ROLES.MANAGER])], order_module_1.oderController.findAll);
orderRoutes.get('/orders/:orderId', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.ADMIN, role_enum_1.ROLES.MANAGER, role_enum_1.ROLES.MEMBER])], order_module_1.oderController.findOne);
orderRoutes.get('/orders/member', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.ADMIN, role_enum_1.ROLES.MEMBER, role_enum_1.ROLES.MANAGER])], order_module_1.oderController.findAllByMember);
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
orderRoutes.delete('/orders/:orderId/remove', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.ADMIN, role_enum_1.ROLES.MANAGER])], order_module_1.oderController.remove);
orderRoutes.get('/orders-history', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.MEMBER, role_enum_1.ROLES.ADMIN, role_enum_1.ROLES.MANAGER])], order_module_1.oderController.findAllByMember);
orderRoutes.get('/orders-dashboard', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.ADMIN, role_enum_1.ROLES.MANAGER])], order_module_1.oderController.dashboardFindAll);
orderRoutes.post('/orders/midtrans', order_module_1.oderController.midtransWebhook);
exports.default = orderRoutes;
