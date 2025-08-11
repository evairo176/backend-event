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
exports.OrderService = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const catch_errors_1 = require("../../cummon/utils/catch-errors");
const id_1 = require("../../cummon/utils/id");
const payment_1 = require("../../cummon/utils/payment");
const database_1 = require("../../database/database");
const nanoid_1 = require("nanoid");
const dashboard_1 = require("../../cummon/utils/dashboard");
class OrderService {
    create(orderData, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            // (opsional) naikin isolation level kalau DB mendukung
            return yield database_1.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                // 1) Validasi event awal (tetap)
                const eventId = orderData[0].eventId;
                const checkExistingEvent = yield tx.event.findFirst({
                    where: { id: eventId },
                    include: { createdBy: { include: { company: true } } },
                });
                if (!checkExistingEvent) {
                    throw new catch_errors_1.BadRequestException('Event not exists', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
                }
                // 2) Agregasi qty per ticketId (kalau ada duplikat item, dijumlah)
                const qtyByTicket = {};
                for (const it of orderData) {
                    qtyByTicket[it.ticketId] =
                        ((_a = qtyByTicket[it.ticketId]) !== null && _a !== void 0 ? _a : 0) + Number(it.quantity || 0);
                }
                const ticketIds = Object.keys(qtyByTicket);
                // 3) Ambil tiketnya sekali (untuk harga & validasi)
                const tickets = yield tx.ticket.findMany({
                    where: { id: { in: ticketIds } },
                    include: { event: true },
                });
                if (tickets.length !== ticketIds.length) {
                    throw new catch_errors_1.BadRequestException('Ticket not exists', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
                }
                // (opsional) pastikan semua ticket memang milik event terkait
                // if (!tickets.every(t => t.eventId === eventId)) {
                //   throw new BadRequestException('Semua tiket harus dari event yang sama');
                // }
                // 4) Hitung total dari harga tiket x qty
                let total = 0;
                for (const t of tickets) {
                    total += Number(t.price) * qtyByTicket[t.id];
                }
                // 5) ATOMIC: kurangi stok tiap tiket
                //    Pakai updateMany + guard quantity >= need agar aman dari race condition.
                for (const t of tickets) {
                    const need = qtyByTicket[t.id];
                    const res = yield tx.ticket.updateMany({
                        where: { id: t.id, quantity: { gte: need } },
                        data: { quantity: { decrement: need } },
                    });
                    if (res.count === 0) {
                        // kalau gagal, transaksi otomatis rollback -> stok tidak berubah
                        throw new catch_errors_1.BadRequestException(`Ticket "${t.name}" stok tidak cukup`);
                    }
                }
                // 6) Buat orderId
                const orderId = yield (0, id_1.generateOrderId)();
                // 7) (Disarankan) panggil Midtrans SETELAH stok di-reserve,
                //    supaya tidak buat link pembayaran kalau stok habis.
                const paymentMidtrans = new payment_1.PaymentMidtrans();
                const generatePayment = yield paymentMidtrans.createLink({
                    transaction_details: { gross_amount: total, order_id: orderId },
                });
                // 8) Simpan payment
                const payment = yield tx.payment.create({
                    data: {
                        token: generatePayment.token,
                        redirect_url: generatePayment.redirect_url,
                    },
                });
                // 9) Simpan order
                const createdOrder = yield tx.order.create({
                    data: {
                        orderId,
                        total,
                        paymentId: payment.id,
                        createById: userData === null || userData === void 0 ? void 0 : userData.createById,
                        updatedById: userData === null || userData === void 0 ? void 0 : userData.createById,
                        companyId: (_b = checkExistingEvent.createdBy) === null || _b === void 0 ? void 0 : _b.companyId,
                    },
                });
                // 10) Simpan order items
                for (const body of orderData) {
                    const ticket = tickets.find((t) => t.id === body.ticketId);
                    yield tx.orderItem.create({
                        data: {
                            orderId: createdOrder.id,
                            eventId: body.eventId,
                            ticketId: body.ticketId,
                            quantity: body.quantity,
                            price: ticket.price,
                        },
                    });
                }
                // 11) Return hasil lengkap
                const result = yield tx.order.findFirst({
                    where: { id: createdOrder.id },
                    include: {
                        items: { include: { event: true, ticket: true } },
                        payment: true,
                    },
                });
                return result;
            }) /*, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable // opsional
        }*/);
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
                    items: {
                        include: {
                            event: true,
                            ticket: {
                                include: {
                                    vouchers: {
                                        where: {
                                            orderId,
                                        },
                                        include: {
                                            ticketScanHistory: {
                                                where: { status: 'SUCCESS' },
                                                take: 1,
                                                orderBy: { createdAt: 'desc' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    payment: true,
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
    completed(orderId, paymentType, paymentDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield database_1.db.order.findFirst({
                where: {
                    orderId,
                },
                include: {
                    items: {
                        include: {
                            event: {
                                include: {
                                    createdBy: true,
                                },
                            },
                        },
                    },
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
                const prefixTicketCode = (order === null || order === void 0 ? void 0 : order.orderId.split('-')[3]) || 'TICKET';
                const vouchers = Array.from({ length: item.quantity }).map(() => ({
                    code: `${prefixTicketCode}_${(0, nanoid_1.nanoid)(21)}`,
                    ticketId: item.ticketId,
                    orderId,
                }));
                // ✅ Execute all DB operations in a transaction
                const [createdVouchers, updatedOrder] = yield database_1.db.$transaction([
                    database_1.db.voucherTicket.createMany({
                        data: vouchers,
                    }),
                    database_1.db.order.update({
                        where: {
                            id: order.id,
                        },
                        data: {
                            status: 'COMPLETED',
                            paymentType,
                            paymentDate,
                        },
                    }),
                ]);
                result.push({
                    createdVouchers,
                    updatedOrder,
                });
            }
            const owner = yield database_1.db.user.findFirst({
                where: {
                    companyId: order.companyId,
                    role: 'company_owner',
                },
            });
            if (owner && order.total > 0) {
                yield database_1.db.$transaction([
                    database_1.db.user.update({
                        where: { id: owner.id },
                        data: {
                            balance: owner.balance + order.total,
                        },
                    }),
                    database_1.db.balanceTransaction.create({
                        data: {
                            userId: owner.id,
                            amount: order.total,
                            type: 'IN',
                            description: `Pemasukan dari order ${order.orderId}`,
                            referenceId: order.id,
                        },
                    }),
                ]);
            }
            return result;
        });
    }
    cancelled(orderId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const order = yield tx.order.findFirst({
                    where: { orderId },
                    include: { items: true },
                });
                if (!order)
                    throw new catch_errors_1.NotFoundException('Order not exists', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
                if (order.status === 'COMPLETED')
                    throw new catch_errors_1.BadRequestException('You have been completed this order');
                if (order.status === 'CANCELLED')
                    throw new catch_errors_1.BadRequestException('This order is already cancelled');
                // Guard: pastikan hanya status tertentu yang bisa di-cancel (anti race)
                const updated = yield tx.order.updateMany({
                    where: {
                        id: order.id,
                        status: { in: ['PENDING', 'CANCELLED', 'COMPLETED'] },
                    },
                    data: {
                        status: 'CANCELLED',
                        updatedById: userId,
                        cancelledAt: new Date(),
                    },
                });
                if (updated.count === 0) {
                    throw new catch_errors_1.BadRequestException('Order cannot be cancelled from current status');
                }
                // Hitung qty per tiket
                const incByTicket = {};
                for (const it of order.items) {
                    incByTicket[it.ticketId] =
                        ((_a = incByTicket[it.ticketId]) !== null && _a !== void 0 ? _a : 0) + Number(it.quantity);
                }
                // Kembalikan stok
                for (const [ticketId, inc] of Object.entries(incByTicket)) {
                    yield tx.ticket.update({
                        where: { id: ticketId },
                        data: { quantity: { increment: inc } },
                    });
                }
                // Return order terbaru
                return tx.order.findFirst({
                    where: { id: order.id },
                    include: { items: true },
                });
            }));
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
    findAllByCompany(_a) {
        return __awaiter(this, arguments, void 0, function* ({ page = 1, limit = 10, search, companyId, }) {
            const query = {
                companyId: companyId,
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
                    include: {
                        createdBy: {
                            select: {
                                fullname: true,
                                email: true,
                                company: true,
                            },
                        },
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
    midtransWebhook(_a) {
        return __awaiter(this, arguments, void 0, function* ({ transactionStatus, order_id, paymentType, paymentDate, }) {
            console.log({ transactionStatus, order_id, paymentType, paymentDate });
            switch (transactionStatus) {
                case 'capture':
                    yield this.completed(order_id, paymentType, paymentDate); // Ganti 'system' dengan userId yang sesuai jika perlu
                    break;
                case 'settlement':
                    // Pembayaran berhasil
                    yield this.completed(order_id, paymentType, paymentDate); // Ganti 'system' dengan userId yang sesuai jika perlu
                    break;
                case 'cancel':
                    yield this.cancelled(order_id);
                    break;
                case 'deny':
                    yield this.cancelled(order_id);
                    break;
                case 'expire':
                    yield this.cancelled(order_id);
                    break;
                case 'pending':
                    break;
            }
            return 'Berhasil memproses webhook Midtrans';
        });
    }
    dashboardFindAll(_a) {
        return __awaiter(this, arguments, void 0, function* ({ filter = 'monthly' }) {
            const now = (0, dayjs_1.default)();
            let startDate = null;
            switch (filter) {
                case 'daily':
                    startDate = now.startOf('day').toDate();
                    break;
                case 'weekly':
                    startDate = now.startOf('week').toDate();
                    break;
                case 'monthly':
                    startDate = now.startOf('month').toDate();
                    break;
                case 'yearly':
                    startDate = now.startOf('year').toDate();
                    break;
                case 'all':
                default:
                    startDate = null;
                    break;
            }
            const query = {};
            if (startDate) {
                query.createdAt = {
                    gte: startDate, // filter dari startDate sampai sekarang
                };
            }
            const [orders, total] = yield Promise.all([
                database_1.db.order.findMany({
                    // where: query,
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
                total,
            };
        });
    }
    dashboardOrderChart() {
        return __awaiter(this, void 0, void 0, function* () {
            const dashboard = new dashboard_1.Dashboard();
            const [hourly, daily, weekly, monthly, yearly, all, prevHourly, prevDaily, prevWeekly, prevMonthly, prevYearly,] = yield Promise.all([
                yield dashboard.getOrderSummaryByTime('hourly'),
                yield dashboard.getOrderSummaryByTime('daily'),
                yield dashboard.getOrderSummaryByTime('weekly'),
                yield dashboard.getOrderSummaryByTime('monthly'),
                yield dashboard.getOrderSummaryByTime('yearly'),
                yield dashboard.getOrderSummaryByTime('all'),
                yield dashboard.getOrderSummaryByTime('prevHourly'),
                yield dashboard.getOrderSummaryByTime('prevDaily'),
                yield dashboard.getOrderSummaryByTime('prevWeekly'),
                yield dashboard.getOrderSummaryByTime('prevMonthly'),
                yield dashboard.getOrderSummaryByTime('prevYearly'),
            ]);
            return {
                hourly,
                daily,
                weekly,
                monthly,
                yearly,
                all,
                prevHourly,
                prevDaily,
                prevWeekly,
                prevMonthly,
                prevYearly,
            };
        });
    }
    dashboardOrderChartCompany(_a) {
        return __awaiter(this, arguments, void 0, function* ({ companyId, }) {
            const dashboard = new dashboard_1.Dashboard();
            const [hourly, daily, weekly, monthly, yearly, all, prevHourly, prevDaily, prevWeekly, prevMonthly, prevYearly,] = yield Promise.all([
                yield dashboard.getOrderSummaryByTimeCompany('hourly', companyId),
                yield dashboard.getOrderSummaryByTimeCompany('daily', companyId),
                yield dashboard.getOrderSummaryByTimeCompany('weekly', companyId),
                yield dashboard.getOrderSummaryByTimeCompany('monthly', companyId),
                yield dashboard.getOrderSummaryByTimeCompany('yearly', companyId),
                yield dashboard.getOrderSummaryByTimeCompany('all', companyId),
                yield dashboard.getOrderSummaryByTimeCompany('prevHourly', companyId),
                yield dashboard.getOrderSummaryByTimeCompany('prevDaily', companyId),
                yield dashboard.getOrderSummaryByTimeCompany('prevWeekly', companyId),
                yield dashboard.getOrderSummaryByTimeCompany('prevMonthly', companyId),
                yield dashboard.getOrderSummaryByTimeCompany('prevYearly', companyId),
            ]);
            return {
                hourly,
                daily,
                weekly,
                monthly,
                yearly,
                all,
                prevHourly,
                prevDaily,
                prevWeekly,
                prevMonthly,
                prevYearly,
            };
        });
    }
}
exports.OrderService = OrderService;
