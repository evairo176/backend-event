"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwt_strategy_1 = require("../../cummon/strategies/jwt.strategy");
const acl_middleware_1 = __importDefault(require("../../middlewares/acl.middleware"));
const media_middleware_1 = __importDefault(require("../../middlewares/media.middleware"));
const media_module_1 = require("./media.module");
const client_1 = require("@prisma/client");
const mediaRoutes = (0, express_1.Router)();
mediaRoutes.post('/media/upload-single', [
    jwt_strategy_1.authenticateJWT,
    (0, acl_middleware_1.default)([client_1.ROLE_USER.admin, client_1.ROLE_USER.company, client_1.ROLE_USER.member]),
    media_middleware_1.default.single('file'),
], media_module_1.mediaController.single);
mediaRoutes.post('/media/upload-multiple', [
    jwt_strategy_1.authenticateJWT,
    (0, acl_middleware_1.default)([client_1.ROLE_USER.admin, client_1.ROLE_USER.company, client_1.ROLE_USER.member]),
    media_middleware_1.default.multiple('files'),
], media_module_1.mediaController.multiple);
mediaRoutes.delete('/media/remove', [
    jwt_strategy_1.authenticateJWT,
    (0, acl_middleware_1.default)([client_1.ROLE_USER.admin, client_1.ROLE_USER.company, client_1.ROLE_USER.member]),
], media_module_1.mediaController.remove);
exports.default = mediaRoutes;
