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
exports.BannerController = void 0;
const async_handler_middleware_1 = require("../../middlewares/async-handler.middleware");
const http_config_1 = require("../../config/http.config");
const banner_validator_1 = require("../../cummon/validators/banner.validator");
class BannerController {
    constructor(bannerService) {
        this.create = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const body = banner_validator_1.createBannerSchema.parse(Object.assign({}, req === null || req === void 0 ? void 0 : req.body));
            const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
            const result = yield this.bannerService.create(Object.assign(Object.assign({}, body), { createById: userId, updatedById: userId }));
            return res.status(http_config_1.HTTPSTATUS.CREATED).json({
                message: 'Create banner successfully',
                data: result,
            });
        }));
        this.findAll = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const query = req === null || req === void 0 ? void 0 : req.query;
            const { banners, limit, page, total, totalPages } = yield this.bannerService.findAll(query);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success find all banner',
                data: banners,
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
            const { banner } = yield this.bannerService.findOne(params.id);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success find one banner',
                data: banner,
            });
        }));
        this.update = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const body = banner_validator_1.updateBannerSchema.parse(Object.assign({}, req === null || req === void 0 ? void 0 : req.body));
            const params = req === null || req === void 0 ? void 0 : req.params;
            const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
            const banner = yield this.bannerService.update(params.id, Object.assign(Object.assign({}, body), { updatedById: userId }));
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success update banner',
                data: banner,
            });
        }));
        this.remove = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const params = req === null || req === void 0 ? void 0 : req.params;
            const banner = yield this.bannerService.remove(params.id);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success delete banner',
                data: banner,
            });
        }));
        this.bannerService = bannerService;
    }
}
exports.BannerController = BannerController;
