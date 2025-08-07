"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const acl_middleware_1 = __importDefault(require("../../middlewares/acl.middleware"));
const express_1 = require("express");
const user_module_1 = require("./user.module");
const jwt_strategy_1 = require("../../cummon/strategies/jwt.strategy");
const client_1 = require("@prisma/client");
const userRoutes = (0, express_1.Router)();
userRoutes.get('/user', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.admin])], user_module_1.userController.findAll);
userRoutes.put('/user/activate', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.admin, client_1.ROLE_USER.company_owner])], user_module_1.userController.updateActivate);
userRoutes.post('/user-add', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.company_owner])], user_module_1.userController.addUser);
userRoutes.get('/user-company', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.company_owner])], user_module_1.userController.companyFindAll);
exports.default = userRoutes;
