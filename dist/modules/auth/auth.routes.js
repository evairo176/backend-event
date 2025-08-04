"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_module_1 = require("./auth.module");
const jwt_strategy_1 = require("../../cummon/strategies/jwt.strategy");
const acl_middleware_1 = __importDefault(require("../../middlewares/acl.middleware"));
const role_enum_1 = require("../../cummon/enums/role.enum");
const authRoutes = (0, express_1.Router)();
authRoutes.post('/auth/register', auth_module_1.authController.register);
authRoutes.post('/auth/register/company', auth_module_1.authController.companyRegister);
authRoutes.post('/auth/login', auth_module_1.authController.login);
authRoutes.get('/auth/me', jwt_strategy_1.authenticateJWT, auth_module_1.authController.me);
authRoutes.put('/auth/me/update', jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.ADMIN, role_enum_1.ROLES.MEMBER, role_enum_1.ROLES.MANAGER]), auth_module_1.authController.updateProfile);
authRoutes.post('/auth/verify/email', auth_module_1.authController.verifyEmail);
authRoutes.put('/auth/password/update', jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.ADMIN, role_enum_1.ROLES.MEMBER, role_enum_1.ROLES.MANAGER]), auth_module_1.authController.updatePassword);
authRoutes.post('/auth/password/forgot', auth_module_1.authController.forgotPassword);
authRoutes.post('/auth/password/reset', auth_module_1.authController.resetPassword);
authRoutes.post('/auth/logout', jwt_strategy_1.authenticateJWT, auth_module_1.authController.logout);
authRoutes.get('/auth/refresh', auth_module_1.authController.refreshToken);
authRoutes.get('/test-acl', jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.ADMIN, role_enum_1.ROLES.MEMBER]), (req, res) => {
    return res.status(200).json({
        message: 'success',
    });
});
exports.default = authRoutes;
