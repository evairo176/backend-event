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
const async_handler_middleware_1 = require("../../middlewares/async-handler.middleware");
const http_config_1 = require("../../config/http.config");
const event_validator_1 = require("../../cummon/validators/event.validator");
class EventController {
    constructor(eventService) {
        this.create = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
            const body = event_validator_1.createEventSchema.parse(Object.assign({}, req.body));
            const result = yield this.eventService.create(Object.assign(Object.assign({}, body), { createById: userId, updatedById: userId }));
            return res.status(http_config_1.HTTPSTATUS.CREATED).json({
                message: 'Create event successfully',
                data: result,
            });
        }));
        this.findAll = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const query = req === null || req === void 0 ? void 0 : req.query;
            const { events, limit, page, total, totalPages } = yield this.eventService.findAll(query);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success find all event',
                data: events,
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
            const result = yield this.eventService.findOne(params.id);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success find all event',
                data: result,
            });
        }));
        this.update = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const params = req === null || req === void 0 ? void 0 : req.params;
            const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
            const body = event_validator_1.updateEventSchema.parse(Object.assign({}, req.body));
            const result = yield this.eventService.update(params.id, Object.assign(Object.assign({}, body), { updatedById: userId }));
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success update a event',
                data: result,
            });
        }));
        this.remove = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const params = req === null || req === void 0 ? void 0 : req.params;
            const result = yield this.eventService.remove(params.id);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success remove event',
                data: result,
            });
        }));
        this.findOneBySlug = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const params = req === null || req === void 0 ? void 0 : req.params;
            const result = yield this.eventService.findOneBySlug(params.slug);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success find one event by slug',
                data: result,
            });
        }));
        this.eventService = eventService;
    }
}
exports.default = EventController;
