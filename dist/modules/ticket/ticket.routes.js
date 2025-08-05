"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwt_strategy_1 = require("../../cummon/strategies/jwt.strategy");
const acl_middleware_1 = __importDefault(require("../../middlewares/acl.middleware"));
const ticket_module_1 = require("./ticket,module");
const client_1 = require("@prisma/client");
const ticketRoutes = (0, express_1.Router)();
ticketRoutes.post('/ticket', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.admin, client_1.ROLE_USER.company])], ticket_module_1.ticketController.create);
ticketRoutes.get('/ticket', ticket_module_1.ticketController.findAll);
ticketRoutes.get('/ticket/:id', ticket_module_1.ticketController.findOne);
ticketRoutes.put('/ticket/:id', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.admin, client_1.ROLE_USER.company])], ticket_module_1.ticketController.update);
ticketRoutes.delete('/ticket/:id', [jwt_strategy_1.authenticateJWT, (0, acl_middleware_1.default)([client_1.ROLE_USER.admin, client_1.ROLE_USER.company])], ticket_module_1.ticketController.remove);
ticketRoutes.get('/ticket/:eventId/event', ticket_module_1.ticketController.findAllByEvent);
exports.default = ticketRoutes;
