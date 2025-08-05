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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const async_handler_middleware_1 = require("../../middlewares/async-handler.middleware");
const http_config_1 = require("../../config/http.config");
const order_validator_1 = require("../../cummon/validators/order.validator");
const id_1 = require("../../cummon/utils/id");
const crypto_1 = __importDefault(require("crypto"));
const app_config_1 = require("../../config/app.config");
class OrderController {
    constructor(orderService) {
        this.create = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
            const body = order_validator_1.createOrderSchema.parse(req === null || req === void 0 ? void 0 : req.body);
            const orderId = yield (0, id_1.generateOrderId)();
            const result = yield this.orderService.create(body, {
                createById: userId,
                updatedById: userId,
                orderId,
            });
            return res.status(http_config_1.HTTPSTATUS.CREATED).json({
                message: 'Success create order',
                data: result,
            });
        }));
        this.findAll = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const query = req === null || req === void 0 ? void 0 : req.query;
            const { orders, limit, page, total, totalPages } = yield this.orderService.findAll(query);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success find all orders',
                data: orders,
                pagination: {
                    limit,
                    page,
                    total,
                    totalPages,
                },
            });
        }));
        this.findOne = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const params = req === null || req === void 0 ? void 0 : req.params;
            const { order } = yield this.orderService.findOne(params.orderId);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success find one order',
                data: order,
            });
        }));
        // public completed = asyncHandler(
        //   async (req: Request, res: Response): Promise<any> => {
        //     const params = req?.params;
        //     const userId = req?.user?.id;
        //     await this.orderService.completed(params.orderId, userId as string);
        //     return res.status(HTTPSTATUS.OK).json({
        //       message: 'order completed',
        //     });
        //   },
        // );
        // public pending = asyncHandler(
        //   async (req: Request, res: Response): Promise<any> => {
        //     const params = req?.params;
        //     const userId = req?.user?.id;
        //     const result = await this.orderService.pending(
        //       params.orderId,
        //       userId as string,
        //     );
        //     return res.status(HTTPSTATUS.OK).json({
        //       data: result,
        //       message: 'order pending',
        //     });
        //   },
        // );
        // public cancelled = asyncHandler(
        //   async (req: Request, res: Response): Promise<any> => {
        //     const params = req?.params;
        //     const userId = req?.user?.id;
        //     const result = await this.orderService.cancelled(
        //       params.orderId,
        //       userId as string,
        //     );
        //     return res.status(HTTPSTATUS.OK).json({
        //       data: result,
        //       message: 'order pending',
        //     });
        //   },
        // );
        this.remove = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const params = req === null || req === void 0 ? void 0 : req.params;
            const result = yield this.orderService.remove(params.orderId);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                data: result,
                message: 'success to remove an order',
            });
        }));
        this.findAllByMember = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const query = req === null || req === void 0 ? void 0 : req.query;
            const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { orders, limit, page, total, totalPages } = yield this.orderService.findAllByMember(Object.assign(Object.assign({}, query), { createById: userId }));
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success find all orders',
                data: orders,
                pagination: {
                    limit,
                    page,
                    total,
                    totalPages,
                },
            });
        }));
        this.findAllByCompany = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const query = req === null || req === void 0 ? void 0 : req.query;
            const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { orders, limit, page, total, totalPages } = yield this.orderService.findAllByCompany(Object.assign(Object.assign({}, query), { createById: userId }));
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success find all orders',
                data: orders,
                pagination: {
                    limit,
                    page,
                    total,
                    totalPages,
                },
            });
        }));
        this.midtransWebhook = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const payload = req.body;
            console.log('🔥 Callback masuk:', req.body);
            const { order_id, status_code, gross_amount, signature_key, payment_type, settlement_time, // <-- ambil ini (jika ada)
            transaction_time, // <-- fallback kalau settlement_time tidak ada
             } = payload;
            // Step 1: Buat hash berdasarkan data Midtrans
            const input = order_id + status_code + gross_amount + app_config_1.config.MIDTRANS.SERVER_KEY;
            const expectedSignature = crypto_1.default
                .createHash('sha512')
                .update(input)
                .digest('hex');
            // Step 2: Cek apakah signature valid
            if (expectedSignature !== signature_key) {
                console.warn('Signature mismatch: Potential spoofed request');
                return res.status(403).json({ message: 'Invalid signature' });
            }
            // Step 3: Lanjutkan logika status pembayaran
            const transactionStatus = payload.transaction_status;
            // Step 3: Tentukan payment date
            const paymentDate = settlement_time || transaction_time || new Date().toISOString();
            yield this.orderService.midtransWebhook({
                transactionStatus,
                order_id,
                paymentType: payment_type,
                paymentDate,
            });
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Midtrans webhook processed successfully',
            });
        }));
        this.dashboardFindAll = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const query = req === null || req === void 0 ? void 0 : req.query;
            const { orders, total } = yield this.orderService.dashboardFindAll(Object.assign(Object.assign({}, query), { filter: query === null || query === void 0 ? void 0 : query.filter }));
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success find all orders',
                data: orders,
                pagination: {
                    total,
                },
            });
        }));
        this.dashboardChart = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.orderService.dashboardOrderChart();
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success find all orders for dashboard chart',
                data: result,
            });
        }));
        this.orderService = orderService;
    }
}
exports.OrderController = OrderController;
