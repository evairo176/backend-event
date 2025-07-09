"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const banner_module_1 = require("./banner.module");
const jwt_strategy_1 = require("../../cummon/strategies/jwt.strategy");
const acl_middleware_1 = __importDefault(require("../../middlewares/acl.middleware"));
const role_enum_1 = require("../../cummon/enums/role.enum");
const bannerRoutes = (0, express_1.Router)();
bannerRoutes.post('/banner', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.ADMIN])], banner_module_1.bannerController.create);
bannerRoutes.get('/banner', banner_module_1.bannerController.findAll);
bannerRoutes.get('/banner/:id', banner_module_1.bannerController.findOne);
bannerRoutes.put('/banner/:id', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.ADMIN])], banner_module_1.bannerController.update);
bannerRoutes.delete('/banner/:id', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([role_enum_1.ROLES.ADMIN])], banner_module_1.bannerController.remove);
exports.default = bannerRoutes;
