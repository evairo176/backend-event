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
const middlewares_1 = require("../../middlewares");
const http_config_1 = require("../../config/http.config");
const category_validator_1 = require("../../cummon/validators/category.validator");
class CategoryController {
    constructor(categoryService) {
        this.create = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const body = category_validator_1.createCategorySchema.parse(Object.assign({}, req === null || req === void 0 ? void 0 : req.body));
            const result = yield this.categoryService.create(body);
            return res.status(http_config_1.HTTPSTATUS.CREATED).json({
                message: 'Create category successfully',
                data: result,
            });
        }));
        this.findAll = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
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
        this.findOne = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const params = req === null || req === void 0 ? void 0 : req.params;
            const { category } = yield this.categoryService.findOne(params.id);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success find one category',
                data: category,
            });
        }));
        this.update = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const body = category_validator_1.createCategorySchema.parse(Object.assign({}, req === null || req === void 0 ? void 0 : req.body));
            const params = req === null || req === void 0 ? void 0 : req.params;
            const category = yield this.categoryService.update(params.id, body);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success update category',
                data: category,
            });
        }));
        this.remove = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
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
