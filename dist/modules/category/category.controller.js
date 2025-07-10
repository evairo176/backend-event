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
exports.CategoryController = void 0;
const http_config_1 = require("../../config/http.config");
const category_validator_1 = require("../../cummon/validators/category.validator");
const async_handler_middleware_1 = require("../../middlewares/async-handler.middleware");
class CategoryController {
    constructor(categoryService) {
        this.create = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const body = category_validator_1.createCategorySchema.parse(Object.assign({}, req === null || req === void 0 ? void 0 : req.body));
            const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
            const result = yield this.categoryService.create(Object.assign(Object.assign({}, body), { createById: userId, updatedById: userId }));
            return res.status(http_config_1.HTTPSTATUS.CREATED).json({
                message: 'Create category successfully',
                data: result,
            });
        }));
        this.findAll = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const query = req === null || req === void 0 ? void 0 : req.query;
            const { categories, limit, page, total, totalPages } = yield this.categoryService.findAll(query);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success find all category',
                data: categories,
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
            const { category } = yield this.categoryService.findOne(params.id);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success find one category',
                data: category,
            });
        }));
        this.update = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const body = category_validator_1.updateCategorySchema.parse(Object.assign({}, req === null || req === void 0 ? void 0 : req.body));
            const params = req === null || req === void 0 ? void 0 : req.params;
            const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
            const category = yield this.categoryService.update(params.id, Object.assign(Object.assign({}, body), { updatedById: userId }));
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success update category',
                data: category,
            });
        }));
        this.remove = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const params = req === null || req === void 0 ? void 0 : req.params;
            const category = yield this.categoryService.remove(params.id);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success delete category',
                data: category,
            });
        }));
        this.categoryService = categoryService;
    }
}
exports.CategoryController = CategoryController;
