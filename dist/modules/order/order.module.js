"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oderController = exports.orderService = void 0;
const order_controller_1 = require("./order.controller");
const order_service_1 = require("./order.service");
const orderService = new order_service_1.OrderService();
exports.orderService = orderService;
const oderController = new order_controller_1.OrderController(orderService);
exports.oderController = oderController;
