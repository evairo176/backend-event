"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_module_1 = require("./event.module");
const jwt_strategy_1 = require("../../cummon/strategies/jwt.strategy");
const acl_middleware_1 = __importDefault(require("../../middlewares/acl.middleware"));
const client_1 = require("@prisma/client");
const eventRoutes = (0, express_1.Router)();
eventRoutes.post('/event', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.admin, client_1.ROLE_USER.company])], event_module_1.eventController.create);
eventRoutes.get('/event', event_module_1.eventController.findAll);
eventRoutes.get('/event-company', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.company])], event_module_1.eventController.companyFindAll);
eventRoutes.get('/event/:id', event_module_1.eventController.findOne);
eventRoutes.put('/event/:id', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.admin, client_1.ROLE_USER.company])], event_module_1.eventController.update);
eventRoutes.delete('/event/:id', jwt_strategy_1.authenticateJWT, event_module_1.eventController.remove);
eventRoutes.get('/event/:slug/slug', event_module_1.eventController.findOneBySlug);
exports.default = eventRoutes;
