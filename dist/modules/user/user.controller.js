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
exports.UserController = void 0;
const async_handler_middleware_1 = require("../../middlewares/async-handler.middleware");
const http_config_1 = require("../../config/http.config");
const user_validator_1 = require("../../cummon/validators/user.validator");
class UserController {
    constructor(userService) {
        this.findAll = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const query = req === null || req === void 0 ? void 0 : req.query;
            const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { users, limit, page, total, totalPages } = yield this.userService.findAll(Object.assign(Object.assign({}, query), { userId: userId }));
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success find all user',
                data: users,
                pagination: {
                    limit,
                    page,
                    total,
                    totalPages,
                },
            });
        }));
        this.updateActivate = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const body = user_validator_1.updateActivateSchema.parse(req === null || req === void 0 ? void 0 : req.body);
            const { status } = yield this.userService.updateActivate(Object.assign({}, body));
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Update activate successfully',
                data: status,
            });
        }));
        this.userService = userService;
    }
}
exports.UserController = UserController;
