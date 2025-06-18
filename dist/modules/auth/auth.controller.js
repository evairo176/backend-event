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
exports.AuthController = void 0;
const middlewares_1 = require("../../middlewares");
const http_config_1 = require("../../config/http.config");
const auth_validator_1 = require("../../cummon/validators/auth.validator");
const cookies_1 = require("../../cummon/utils/cookies");
class AuthController {
    constructor(authService) {
        this.register = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const body = auth_validator_1.registerSchema.parse(Object.assign({}, req === null || req === void 0 ? void 0 : req.body));
            const result = yield this.authService.register(body);
            return res.status(http_config_1.HTTPSTATUS.CREATED).json({
                message: 'User registered successfully',
                data: result.user,
            });
        }));
        this.login = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userAgent = req === null || req === void 0 ? void 0 : req.headers['user-agent'];
            const body = auth_validator_1.loginSchema.parse(Object.assign(Object.assign({}, req === null || req === void 0 ? void 0 : req.body), { userAgent }));
            const result = yield this.authService.login(body);
            if (result.mfaRequired) {
                return res.status(http_config_1.HTTPSTATUS.OK).json({
                    message: 'Verify MFA authentication',
                    mfaRequired: result.mfaRequired,
                    user: result.user,
                });
            }
            return (0, cookies_1.setAuthenticationCookies)({
                res,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            })
                .status(http_config_1.HTTPSTATUS.OK)
                .json({
                message: 'User login successfully',
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                mfaRequired: result.mfaRequired,
            });
        }));
        this.me = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'get user successfully',
                user: user,
            });
        }));
        this.authService = authService;
    }
}
exports.AuthController = AuthController;
