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
const http_config_1 = require("../../config/http.config");
const async_handler_middleware_1 = require("../../middlewares/async-handler.middleware");
class RegionController {
    constructor(regionService) {
        this.findByCity = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const result = yield this.regionService.findByCity(query === null || query === void 0 ? void 0 : query.name);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success get region by city name',
                data: result,
            });
        }));
        this.getAllProvinces = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.regionService.getAllProvinces();
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success get all provinces',
                data: result,
            });
        }));
        this.getProvince = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const params = req.params;
            const result = yield this.regionService.getProvince(params === null || params === void 0 ? void 0 : params.code);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success get a province',
                data: result,
            });
        }));
        this.getRegency = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const result = yield this.regionService.getRegency(query === null || query === void 0 ? void 0 : query.id);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success get regencies',
                data: result,
            });
        }));
        this.getDistrict = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const result = yield this.regionService.getDistrict(query === null || query === void 0 ? void 0 : query.code);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success get districts',
                data: result,
            });
        }));
        this.getVillage = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const result = yield this.regionService.getVillage(query === null || query === void 0 ? void 0 : query.code);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success get villages',
                data: result,
            });
        }));
        this.regionService = regionService;
    }
}
exports.default = RegionController;
