"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const acl_middleware_1 = __importDefault(require("../../middlewares/acl.middleware"));
const role_enum_1 = require("../../cummon/enums/role.enum");
const express_1 = require("express");
const user_module_1 = require("./user.module");
const jwt_strategy_1 = require("../../cummon/strategies/jwt.strategy");
const userRoutes = (0, express_1.Router)();
userRoutes.get('/user', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.ADMIN])], user_module_1.userController.findAll);
userRoutes.put('/user/activate', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.ADMIN])], user_module_1.userController.updateActivate);
exports.default = userRoutes;
