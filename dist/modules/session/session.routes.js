"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const session_module_1 = require("./session.module");
const jwt_strategy_1 = require("../../cummon/strategies/jwt.strategy");
const acl_middleware_1 = __importDefault(require("../../middlewares/acl.middleware"));
const role_enum_1 = require("../../cummon/enums/role.enum");
const sessionRoutes = (0, express_1.Router)();
sessionRoutes.get('/session/user', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.ADMIN])], session_module_1.sessionController.getAllSessionUser);
sessionRoutes.get('/session/all', jwt_strategy_1.authenticateJWT, session_module_1.sessionController.getAllSession);
sessionRoutes.get('/session/', jwt_strategy_1.authenticateJWT, session_module_1.sessionController.getSession);
sessionRoutes.delete('/session/:id', jwt_strategy_1.authenticateJWT, session_module_1.sessionController.deleteSession);
exports.default = sessionRoutes;
