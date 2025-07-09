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
exports.BannerService = void 0;
const catch_errors_1 = require("../../cummon/utils/catch-errors");
const database_1 = require("../../database/database");
class BannerService {
    create(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const findBanner = yield database_1.db.banner.findFirst({
                where: {
                    title: body === null || body === void 0 ? void 0 : body.title,
                },
            });
            if (findBanner) {
                throw new catch_errors_1.BadRequestException('Banner already exists with this name', "BANNER_NAME_ALREADY_EXISTS" /* ErrorCode.BANNER_NAME_ALREADY_EXISTS */);
            }
            const banner = yield database_1.db.banner.create({
                data: Object.assign({}, body),
            });
            return banner;
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
                        title: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                ];
            }
            const [banners, total] = yield Promise.all([
                database_1.db.banner.findMany({
                    where: query,
                    skip,
                    take,
                    orderBy: { updatedAt: 'desc' },
                }),
                database_1.db.banner.count({
                    where: query,
                }),
            ]);
            return {
                banners,
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            };
        });
    }
    findOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const banner = yield database_1.db.banner.findFirst({
                where: {
                    id,
                },
            });
            return {
                banner,
            };
        });
    }
    update(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            if (body === null || body === void 0 ? void 0 : body.title) {
                // Cari kategori dengan nama yang sama, tapi berbeda ID
                const findBanner = yield database_1.db.banner.findFirst({
                    where: {
                        title: body === null || body === void 0 ? void 0 : body.title,
                        NOT: {
                            id: id,
                        },
                    },
                });
                if (findBanner) {
                    throw new catch_errors_1.BadRequestException('Banner already exists with this name', "BANNER_NAME_ALREADY_EXISTS" /* ErrorCode.BANNER_NAME_ALREADY_EXISTS */);
                }
            }
            const bannerExisting = yield database_1.db.banner.findFirst({
                where: { id },
            });
            // Lakukan update
            const banner = yield database_1.db.banner.update({
                where: { id },
                data: {
                    title: (body === null || body === void 0 ? void 0 : body.title) ? body === null || body === void 0 ? void 0 : body.title : bannerExisting === null || bannerExisting === void 0 ? void 0 : bannerExisting.title,
                    image: (body === null || body === void 0 ? void 0 : body.image) ? body === null || body === void 0 ? void 0 : body.image : bannerExisting === null || bannerExisting === void 0 ? void 0 : bannerExisting.image,
                    isShow: (body === null || body === void 0 ? void 0 : body.isShow) ? body === null || body === void 0 ? void 0 : body.isShow : bannerExisting === null || bannerExisting === void 0 ? void 0 : bannerExisting.isShow,
                },
            });
            return banner;
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Cari kategori dengan nama yang sama, tapi berbeda ID
            const findBanner = yield database_1.db.banner.findFirst({
                where: {
                    id,
                },
            });
            if (!findBanner) {
                throw new catch_errors_1.BadRequestException('Banner not exists', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
            }
            yield database_1.db.banner.delete({
                where: {
                    id: findBanner.id,
                },
            });
            return findBanner;
        });
    }
}
exports.BannerService = BannerService;
