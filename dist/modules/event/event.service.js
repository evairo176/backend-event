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
const catch_errors_1 = require("../../cummon/utils/catch-errors");
const slug_1 = __importDefault(require("../../cummon/utils/slug"));
const database_1 = require("../../database/database");
class EventService {
    create(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const nameSlug = slug_1.default.generate(body.name);
            const result = yield database_1.db.event.create({
                data: Object.assign(Object.assign({}, body), { slug: nameSlug }),
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
            const [events, total] = yield Promise.all([
                database_1.db.event.findMany({
                    where: query,
                    skip,
                    take,
                    orderBy: { updatedAt: 'desc' },
                }),
                database_1.db.event.count({
                    where: query,
                }),
            ]);
            return {
                events,
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            };
        });
    }
    findOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield database_1.db.event.findFirst({
                where: {
                    id,
                },
            });
            return result;
        });
    }
    update(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const nameSlug = slug_1.default.generate(body === null || body === void 0 ? void 0 : body.name);
            const findEvent = yield database_1.db.event.findFirst({
                where: {
                    name: nameSlug,
                    NOT: {
                        id: id,
                    },
                },
            });
            if (findEvent) {
                throw new catch_errors_1.BadRequestException('Event already exists with this name', "EVENT_NAME_ALREADY_EXISTS" /* ErrorCode.EVENT_NAME_ALREADY_EXISTS */);
            }
            const updatedEvent = yield database_1.db.event.update({
                where: {
                    id,
                },
                data: Object.assign(Object.assign({}, body), { slug: nameSlug }),
            });
            return updatedEvent;
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Cari kategori dengan nama yang sama, tapi berbeda ID
            const findEvent = yield database_1.db.event.findFirst({
                where: {
                    id,
                },
            });
            if (!findEvent) {
                throw new catch_errors_1.BadRequestException('Event not exists', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
            }
            yield database_1.db.event.delete({
                where: {
                    id: findEvent.id,
                },
            });
            return findEvent;
        });
    }
    findOneBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield database_1.db.event.findFirst({
                where: {
                    slug,
                },
            });
            return result;
        });
    }
}
exports.default = EventService;
