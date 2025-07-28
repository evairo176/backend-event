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
exports.OrderService = void 0;
const catch_errors_1 = require("../../cummon/utils/catch-errors");
const id_1 = require("../../cummon/utils/id");
const payment_1 = require("../../cummon/utils/payment");
const database_1 = require("../../database/database");
const nanoid_1 = require("nanoid");
class OrderService {
    create(orderData, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield database_1.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const results = [];
                for (const body of orderData) {
                    const existingTicket = yield tx.ticket.findFirst({
                        where: { id: body.ticketId },
                    });
                    if (!existingTicket) {
                        throw new catch_errors_1.BadRequestException('Ticket not exists', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
                    }
                    const existingEvent = yield tx.event.findFirst({
                        where: { id: body.eventId },
                    });
                    if (!existingEvent) {
                        throw new catch_errors_1.NotFoundException('Event not exists', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
                    }
                    if (existingTicket.quantity < body.quantity) {
                        throw new catch_errors_1.BadRequestException('Ticket quantity is not enough');
                    }
                    const orderId = yield (0, id_1.generateOrderId)();
                    const total = +existingTicket.price * +body.quantity;
                    // Midtrans request tetap di luar transaksi DB
                    const paymentMidtrans = new payment_1.PaymentMidtrans();
                    const generatePayment = yield paymentMidtrans.createLink({
                        transaction_details: {
                            gross_amount: total,
                            order_id: orderId,
                        },
                    });
                    const payment = yield tx.payment.create({
                        data: {
                            token: generatePayment.token,
                            redirect_url: generatePayment.redirect_url,
                        },
                    });
                    const createdOrder = yield tx.order.create({
                        data: Object.assign(Object.assign({}, body), { orderId,
                            total, paymentId: payment.id, createById: userData === null || userData === void 0 ? void 0 : userData.createById, updatedById: userData === null || userData === void 0 ? void 0 : userData.createById }),
                    });
                    const result = yield tx.order.findFirst({
                        where: { id: createdOrder.id },
                        include: {
                            event: true,
                            ticket: true,
                            payment: true,
                            vouchers: true,
                        },
                    });
                    results.push(result);
                }
                return results;
            }));
        });
    }
    findAll(_a) {
        return __awaiter(this, arguments, void 0, function* ({ page = 1, limit = 10, search }) {
            const query = {};
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            if (search) {
                query.OR = [
                // {
                //   name: {
                //     contains: search,
                //     mode: 'insensitive',
                //   },
                // },
                // {
                //   description: {
                //     contains: search,
                //     mode: 'insensitive',
                //   },
                // },
                ];
            }
            const [orders, total] = yield Promise.all([
                database_1.db.order.findMany({
                    where: query,
                    skip,
                    take,
                    orderBy: { updatedAt: 'desc' },
                }),
                database_1.db.order.count({
                    where: query,
                }),
            ]);
            return {
                orders,
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            };
        });
    }
    findOne(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield database_1.db.order.findFirst({
                where: {
                    orderId,
                },
            });
            if (!order) {
                throw new catch_errors_1.NotFoundException('Order not exists', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
            }
            return {
                order,
            };
        });
    }
    completed(orderId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield database_1.db.order.findFirst({
                where: {
                    orderId,
                    createById: userId,
                },
            });
            if (!order) {
                throw new catch_errors_1.NotFoundException('Order not exists', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
            }
            if (order.status === 'COMPLETED') {
                throw new catch_errors_1.BadRequestException('You have been completed this order');
            }
            const ticket = yield database_1.db.ticket.findFirst({
                where: {
                    id: order.ticketId,
                },
            });
            if (!ticket) {
                throw new catch_errors_1.NotFoundException('Ticket on not exists this order', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
            }
            const vouchers = Array.from({ length: order.quantity }).map(() => ({
                isPrint: false,
                voucherId: (0, nanoid_1.nanoid)(21),
                orderId: order.id,
                createById: userId,
            }));
            // ✅ Execute all DB operations in a transaction
            const [createdVouchers, updatedOrder, updatedTicket] = yield database_1.db.$transaction([
                database_1.db.voucher.createMany({
                    data: vouchers,
                }),
                database_1.db.order.update({
                    where: {
                        id: order.id,
                    },
                    data: {
                        status: 'COMPLETED',
                    },
                }),
                database_1.db.ticket.update({
                    where: {
                        id: ticket.id,
                    },
                    data: {
                        quantity: ticket.quantity - order.quantity,
                    },
                }),
            ]);
            return {
                vouchers: createdVouchers,
                order: updatedOrder,
                ticket: updatedTicket,
            };
        });
    }
    pending(orderId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield database_1.db.order.findFirst({
                where: {
                    orderId,
                    createById: userId,
                },
            });
            if (!order) {
                throw new catch_errors_1.NotFoundException('Order not exists', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
            }
            if (order.status === 'COMPLETED') {
                throw new catch_errors_1.BadRequestException('You have been completed this order');
            }
            if (order.status === 'PENDING') {
                throw new catch_errors_1.BadRequestException('This order is already payment pending');
            }
            const result = yield database_1.db.order.update({
                where: {
                    id: order.id,
                },
                data: {
                    status: 'PENDING',
                },
            });
            return result;
        });
    }
    cancelled(orderId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield database_1.db.order.findFirst({
                where: {
                    orderId,
                    createById: userId,
                },
            });
            if (!order) {
                throw new catch_errors_1.NotFoundException('Order not exists', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
            }
            if (order.status === 'COMPLETED') {
                throw new catch_errors_1.BadRequestException('You have been completed this order');
            }
            if (order.status === 'CANCELLED') {
                throw new catch_errors_1.BadRequestException('This order is already cancelled');
            }
            const result = yield database_1.db.order.update({
                where: {
                    id: order.id,
                },
                data: {
                    status: 'CANCELLED',
                },
            });
            return result;
        });
    }
    remove(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield database_1.db.order.delete({
                where: {
                    orderId,
                },
            });
            if (!result) {
                throw new catch_errors_1.NotFoundException('Order not exists', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
            }
            return result;
        });
    }
    findAllByMember(_a) {
        return __awaiter(this, arguments, void 0, function* ({ page = 1, limit = 10, search, createById, }) {
            const query = {
                createById: createById,
            };
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            if (search) {
                query.OR = [
                // {
                //   name: {
                //     contains: search,
                //     mode: 'insensitive',
                //   },
                // },
                // {
                //   description: {
                //     contains: search,
                //     mode: 'insensitive',
                //   },
                // },
                ];
            }
            const [orders, total] = yield Promise.all([
                database_1.db.order.findMany({
                    where: query,
                    skip,
                    take,
                    orderBy: { updatedAt: 'desc' },
                }),
                database_1.db.order.count({
                    where: query,
                }),
            ]);
            return {
                orders,
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            };
        });
    }
}
exports.OrderService = OrderService;
