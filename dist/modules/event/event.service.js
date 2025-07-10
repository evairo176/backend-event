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
            const findEvent = yield database_1.db.event.findFirst({
                where: {
                    slug: nameSlug,
                },
            });
            if (findEvent) {
                throw new catch_errors_1.BadRequestException('Event already exists with this name', "EVENT_NAME_ALREADY_EXISTS" /* ErrorCode.EVENT_NAME_ALREADY_EXISTS */);
            }
            const currentCategoryId = yield database_1.db.category.findUnique({
                where: { id: body === null || body === void 0 ? void 0 : body.categoryId },
            });
            if (!currentCategoryId) {
                throw new catch_errors_1.NotFoundException('Category not found', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
            }
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
                    {
                        address: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        category: {
                            name: {
                                contains: search,
                                mode: 'insensitive',
                            },
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
                    include: {
                        category: true,
                        city: true,
                    },
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
            if (body === null || body === void 0 ? void 0 : body.name) {
                const findEvent = yield database_1.db.event.findFirst({
                    where: {
                        slug: nameSlug,
                        NOT: {
                            id: id,
                        },
                    },
                });
                if (findEvent) {
                    throw new catch_errors_1.BadRequestException('Event already exists with this name', "EVENT_NAME_ALREADY_EXISTS" /* ErrorCode.EVENT_NAME_ALREADY_EXISTS */);
                }
            }
            // Fetch current event for fallback data
            const currentEvent = yield database_1.db.event.findUnique({
                where: { id },
            });
            if (!currentEvent) {
                throw new catch_errors_1.NotFoundException('Category not found', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
            }
            if (body === null || body === void 0 ? void 0 : body.categoryId) {
                const currentCatgeoryId = yield database_1.db.category.findUnique({
                    where: { id: body === null || body === void 0 ? void 0 : body.categoryId },
                });
                if (!currentCatgeoryId) {
                    throw new catch_errors_1.NotFoundException('Category not found');
                }
            }
            const updatedEvent = yield database_1.db.event.update({
                where: {
                    id,
                },
                data: {
                    name: (body === null || body === void 0 ? void 0 : body.name) ? body === null || body === void 0 ? void 0 : body.name : currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.name,
                    slug: (body === null || body === void 0 ? void 0 : body.name) ? nameSlug : currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.slug,
                    banner: (body === null || body === void 0 ? void 0 : body.banner) ? body === null || body === void 0 ? void 0 : body.banner : currentEvent.banner,
                    categoryId: (body === null || body === void 0 ? void 0 : body.categoryId)
                        ? body === null || body === void 0 ? void 0 : body.categoryId
                        : currentEvent.categoryId,
                    startDate: body.startDate ? body.startDate : currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.startDate,
                    endDate: body.endDate ? body.endDate : currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.endDate,
                    isFeatured: String(body.isFeatured)
                        ? body.isFeatured
                        : currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.isFeatured,
                    isOnline: String(body.isOnline)
                        ? body.isOnline
                        : currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.isOnline,
                    isPublished: String(body.isPublished)
                        ? body.isPublished
                        : currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.isPublished,
                    description: body.description
                        ? body.description
                        : currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.description,
                    regionId: body.regionId ? body.regionId : currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.regionId,
                    address: body.address ? body.address : currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.address,
                    latitude: body.latitude ? body.latitude : currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.latitude,
                    longitude: body.longitude ? body.longitude : currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.longitude,
                },
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
