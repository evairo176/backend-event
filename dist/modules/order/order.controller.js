"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const async_handler_middleware_1 = require("../../middlewares/async-handler.middleware");
const http_config_1 = require("../../config/http.config");
const order_validator_1 = require("../../cummon/validators/order.validator");
const id_1 = require("../../cummon/utils/id");
class OrderController {
    constructor(orderService) {
        this.create = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
            const body = order_validator_1.createOrderSchema.parse(Object.assign({}, req === null || req === void 0 ? void 0 : req.body));
            const orderId = yield (0, id_1.generateOrderId)();
            const result = yield this.orderService.create(Object.assign(Object.assign({}, body), { createById: userId, updatedById: userId, orderId }));
            return res.status(http_config_1.HTTPSTATUS.CREATED).json({
                message: 'Success create order',
                data: result,
            });
        }));
        this.orderService = orderService;
    }
}
exports.OrderController = OrderController;
