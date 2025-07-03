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
exports.CategoryService = void 0;
const catch_errors_1 = require("../../cummon/utils/catch-errors");
const database_1 = require("../../database/database");
class CategoryService {
    create(_a) {
        return __awaiter(this, arguments, void 0, function* ({ name, description, icon }) {
            const findCategory = yield database_1.db.category.findFirst({
                where: {
                    name: name,
                },
            });
            if (findCategory) {
                throw new catch_errors_1.BadRequestException('Category already exists with this name', "CATEGORY_NAME_ALREADY_EXISTS" /* ErrorCode.CATEGORY_NAME_ALREADY_EXISTS */);
            }
            const category = yield database_1.db.category.create({
                data: {
                    name,
                    description,
                    icon,
                },
            });
            return category;
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
            const [categories, total] = yield Promise.all([
                database_1.db.category.findMany({
                    where: query,
                    skip,
                    take,
                    orderBy: { updatedAt: 'desc' },
                }),
                database_1.db.category.count({
                    where: query,
                }),
            ]);
            return {
                categories,
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            };
        });
    }
    findOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const category = yield database_1.db.category.findFirst({
                where: {
                    id,
                },
            });
            return {
                category,
            };
        });
    }
    update(id_1, _a) {
        return __awaiter(this, arguments, void 0, function* (id, { name, description, icon }) {
            if (name) {
                // Cari kategori dengan nama yang sama, tapi berbeda ID
                const findCategory = yield database_1.db.category.findFirst({
                    where: {
                        name: name,
                        NOT: {
                            id: id,
                        },
                    },
                });
                if (findCategory) {
                    throw new catch_errors_1.BadRequestException('Category already exists with this name', "CATEGORY_NAME_ALREADY_EXISTS" /* ErrorCode.CATEGORY_NAME_ALREADY_EXISTS */);
                }
            }
            const categoryExisting = yield database_1.db.category.findFirst({
                where: { id },
            });
            // Lakukan update
            const category = yield database_1.db.category.update({
                where: { id },
                data: {
                    name: name ? name : categoryExisting === null || categoryExisting === void 0 ? void 0 : categoryExisting.name,
                    description: description ? description : categoryExisting === null || categoryExisting === void 0 ? void 0 : categoryExisting.description,
                    icon: icon ? icon : categoryExisting === null || categoryExisting === void 0 ? void 0 : categoryExisting.icon,
                },
            });
            return category;
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Cari kategori dengan nama yang sama, tapi berbeda ID
            const findCategory = yield database_1.db.category.findFirst({
                where: {
                    id,
                },
            });
            if (!findCategory) {
                throw new catch_errors_1.BadRequestException('Category not exists', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
            }
            yield database_1.db.category.delete({
                where: {
                    id: findCategory.id,
                },
            });
            return findCategory;
        });
    }
}
exports.CategoryService = CategoryService;
