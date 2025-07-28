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
                // Ambil tiket & validasi sebelum membuat order
                let total = 0;
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
                    total += +existingTicket.price * +body.quantity;
                }
                // Buat orderId
                const orderId = yield (0, id_1.generateOrderId)();
                // Midtrans request (masih tetap di luar loop dan di dalam transaksi)
                const paymentMidtrans = new payment_1.PaymentMidtrans();
                const generatePayment = yield paymentMidtrans.createLink({
                    transaction_details: {
                        gross_amount: total,
                        order_id: orderId,
                    },
                });
                // Simpan payment
                const payment = yield tx.payment.create({
                    data: {
                        token: generatePayment.token,
                        redirect_url: generatePayment.redirect_url,
                    },
                });
                // Simpan order
                const createdOrder = yield tx.order.create({
                    data: {
                        orderId,
                        total,
                        paymentId: payment.id,
                        createById: userData === null || userData === void 0 ? void 0 : userData.createById,
                        updatedById: userData === null || userData === void 0 ? void 0 : userData.createById,
                    },
                });
                // Simpan orderItem berdasarkan masing-masing tiket
                for (const body of orderData) {
                    const existingTicket = yield tx.ticket.findFirst({
                        where: { id: body.ticketId },
                    });
                    yield tx.orderItem.create({
                        data: {
                            orderId: createdOrder.id,
                            eventId: body.eventId,
                            ticketId: body.ticketId,
                            quantity: body.quantity,
                            price: existingTicket.price,
                        },
                    });
                }
                // Ambil order beserta relasinya
                const result = yield tx.order.findFirst({
                    where: { id: createdOrder.id },
                    include: {
                        items: {
                            include: {
                                event: true,
                                ticket: {
                                    include: {
                                        vouchers: true,
                                    },
                                },
                            },
                        },
                        payment: true,
                    },
                });
                return result;
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
                    include: {
                        payment: true,
                    },
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
                include: {
                    items: true,
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
    completed(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield database_1.db.order.findFirst({
                where: {
                    orderId,
                },
                include: {
                    items: true,
                },
            });
            if (!order) {
                throw new catch_errors_1.NotFoundException('Order not exists', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
            }
            if (order.status === 'COMPLETED') {
                throw new catch_errors_1.BadRequestException('You have been completed this order');
            }
            const result = [];
            for (const item of order.items) {
                const ticket = yield database_1.db.ticket.findFirst({
                    where: {
                        id: item.ticketId,
                    },
                });
                if (!ticket) {
                    throw new catch_errors_1.NotFoundException('Ticket on not exists this order', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
                }
                const vouchers = Array.from({ length: item.quantity }).map(() => ({
                    code: (0, nanoid_1.nanoid)(21),
                    ticketId: item.ticketId,
                }));
                // ✅ Execute all DB operations in a transaction
                const [createdVouchers, updatedOrder, updatedTicket] = yield database_1.db.$transaction([
                    database_1.db.vocherTicket.createMany({
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
                            quantity: ticket.quantity - item.quantity,
                        },
                    }),
                ]);
                result.push({
                    createdVouchers,
                    updatedOrder,
                    updatedTicket,
                });
            }
            return result;
        });
    }
    pending(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield database_1.db.order.findFirst({
                where: {
                    orderId,
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
    cancelled(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield database_1.db.order.findFirst({
                where: {
                    orderId,
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
    midtransWebhook(_a) {
        return __awaiter(this, arguments, void 0, function* ({ transactionStatus, order_id, }) {
            switch (transactionStatus) {
                case 'capture':
                case 'settlement':
                    // Pembayaran berhasil
                    yield this.completed(order_id); // Ganti 'system' dengan userId yang sesuai jika perlu
                    break;
                case 'cancel':
                    yield this.cancelled(order_id);
                    break;
                case 'deny':
                case 'expire':
                    // Pembayaran gagal
                    // await db.order.update({
                    //   where: { orderId: order_id },
                    //   data: { status: 'FAILED' },
                    // });
                    break;
                case 'pending':
                    yield this.pending(order_id); // Ganti 'system' dengan userId yang sesuai jika perlu
                    break;
            }
            return 'Berhasil memproses webhook Midtrans';
        });
    }
}
exports.OrderService = OrderService;
