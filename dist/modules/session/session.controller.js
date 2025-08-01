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
exports.SessionController = void 0;
const http_config_1 = require("../../config/http.config");
const catch_errors_1 = require("../../cummon/utils/catch-errors");
const zod_1 = require("zod");
const async_handler_middleware_1 = require("../../middlewares/async-handler.middleware");
class SessionController {
    constructor(sessionService) {
        this.getAllSessionUser = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const sessionId = req.sessionId;
            const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { sessions } = yield this.sessionService.getAllSessionUser(userId);
            const modifySession = sessions === null || sessions === void 0 ? void 0 : sessions.map((session) => {
                return Object.assign(Object.assign({}, session), { isCurrent: session.id === sessionId ? true : false });
            });
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Retrieved all session user successfully',
                sessions: modifySession,
            });
        }));
        this.getAllSession = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
            const sessionId = req.sessionId;
            const { sessions } = yield this.sessionService.getAllSession(userId);
            const modifySession = sessions === null || sessions === void 0 ? void 0 : sessions.map((session) => {
                return Object.assign(Object.assign({}, session), { isCurrent: session.id === sessionId ? true : false });
            });
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Retrieved all session successfully',
                sessions: modifySession,
            });
        }));
        this.getSession = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const sessionId = req.sessionId;
            if (!sessionId) {
                throw new catch_errors_1.NotFoundException('Session ID not found. please login again');
            }
            const { user } = yield this.sessionService.getSessionById(sessionId);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Retrieved session successfully',
                user,
            });
        }));
        this.deleteSession = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const sessionId = zod_1.z.string().parse((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.id);
            const userId = (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.id;
            yield this.sessionService.deleteSession(sessionId, userId);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Session remove successfully',
            });
        }));
        this.sessionService = sessionService;
    }
}
exports.SessionController = SessionController;
