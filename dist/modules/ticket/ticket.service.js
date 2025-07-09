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
exports.TicketService = void 0;
const catch_errors_1 = require("../../cummon/utils/catch-errors");
const database_1 = require("../../database/database");
class TicketService {
    create(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const findTicket = yield database_1.db.ticket.findFirst({
                where: {
                    name: body === null || body === void 0 ? void 0 : body.name,
                    eventId: body === null || body === void 0 ? void 0 : body.eventId,
                },
            });
            if (findTicket) {
                throw new catch_errors_1.BadRequestException('Ticket already exists with this name & event', "TICKET_NAME_ALREADY_EXISTS" /* ErrorCode.TICKET_NAME_ALREADY_EXISTS */);
            }
            const currentEventId = yield database_1.db.event.findUnique({
                where: { id: body === null || body === void 0 ? void 0 : body.eventId },
            });
            if (!currentEventId) {
                throw new catch_errors_1.NotFoundException('Event not found', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
            }
            const result = yield database_1.db.ticket.create({
                data: Object.assign({}, body),
            });
            return result;
        });
    }
    findAll(_a) {
        return __awaiter(this, arguments, void 0, function* ({ page = 1, limit = 10, search }) {
            const query = {};
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            if (search) {
                query.OR = [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        description: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                ];
            }
            const [tickets, total] = yield Promise.all([
                database_1.db.ticket.findMany({
                    where: query,
                    skip,
                    take,
                    orderBy: { updatedAt: 'desc' },
                }),
                database_1.db.ticket.count({
                    where: query,
                }),
            ]);
            return {
                tickets,
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            };
        });
    }
    findOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield database_1.db.ticket.findFirst({
                where: {
                    id,
                },
            });
            return result;
        });
    }
    update(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            if (body === null || body === void 0 ? void 0 : body.name) {
                const findTicket = yield database_1.db.ticket.findFirst({
                    where: {
                        name: body === null || body === void 0 ? void 0 : body.name,
                        eventId: body === null || body === void 0 ? void 0 : body.eventId,
                        NOT: {
                            id: id,
                        },
                    },
                });
                if (findTicket) {
                    throw new catch_errors_1.BadRequestException('Ticket already exists with this name & event', "TICKET_NAME_ALREADY_EXISTS" /* ErrorCode.TICKET_NAME_ALREADY_EXISTS */);
                }
            }
            // Fetch current ticket for fallback data
            const currentTicket = yield database_1.db.ticket.findUnique({
                where: { id },
            });
            if (!currentTicket) {
                throw new catch_errors_1.NotFoundException('Ticket not found', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
            }
            if (body === null || body === void 0 ? void 0 : body.eventId) {
                const currentEventId = yield database_1.db.event.findUnique({
                    where: { id: body === null || body === void 0 ? void 0 : body.eventId },
                });
                if (!currentEventId) {
                    throw new catch_errors_1.NotFoundException('Event not found', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
                }
            }
            const updatedTicket = yield database_1.db.ticket.update({
                where: {
                    id,
                },
                data: {
                    name: (body === null || body === void 0 ? void 0 : body.name) ? body === null || body === void 0 ? void 0 : body.name : currentTicket === null || currentTicket === void 0 ? void 0 : currentTicket.name,
                    price: (body === null || body === void 0 ? void 0 : body.price) ? body === null || body === void 0 ? void 0 : body.price : currentTicket === null || currentTicket === void 0 ? void 0 : currentTicket.price,
                    quantity: (body === null || body === void 0 ? void 0 : body.quantity) ? body === null || body === void 0 ? void 0 : body.quantity : currentTicket === null || currentTicket === void 0 ? void 0 : currentTicket.quantity,
                    description: (body === null || body === void 0 ? void 0 : body.description)
                        ? body === null || body === void 0 ? void 0 : body.description
                        : currentTicket === null || currentTicket === void 0 ? void 0 : currentTicket.description,
                    updatedById: (body === null || body === void 0 ? void 0 : body.updatedById)
                        ? body === null || body === void 0 ? void 0 : body.updatedById
                        : currentTicket === null || currentTicket === void 0 ? void 0 : currentTicket.updatedById,
                },
            });
            return updatedTicket;
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const findTicket = yield database_1.db.ticket.findFirst({
                where: {
                    id,
                },
            });
            if (!findTicket) {
                throw new catch_errors_1.BadRequestException('Ticket not exists', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
            }
            yield database_1.db.ticket.delete({
                where: {
                    id: findTicket.id,
                },
            });
            return findTicket;
        });
    }
    findAllByEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield database_1.db.ticket.findMany({
                where: {
                    eventId,
                },
            });
            return result;
        });
    }
}
exports.TicketService = TicketService;
