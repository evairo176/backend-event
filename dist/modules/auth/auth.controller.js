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
const http_config_1 = require("../../config/http.config");
const auth_validator_1 = require("../../cummon/validators/auth.validator");
const cookies_1 = require("../../cummon/utils/cookies");
const catch_errors_1 = require("../../cummon/utils/catch-errors");
const async_handler_middleware_1 = require("../../middlewares/async-handler.middleware");
class AuthController {
    constructor(authService) {
        this.register = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const body = auth_validator_1.registerSchema.parse(Object.assign({}, req === null || req === void 0 ? void 0 : req.body));
            const result = yield this.authService.register(body);
            return res.status(http_config_1.HTTPSTATUS.CREATED).json({
                message: 'User registered successfully',
                data: result.user,
            });
        }));
        this.login = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
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
        this.me = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'get user successfully',
                user: user,
            });
        }));
        this.refreshToken = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const refreshToken = req.headers['refresh-token'];
            // console.log(refreshToken);
            if (!refreshToken) {
                throw new catch_errors_1.UnauthorizedException('Missing refresh token');
            }
            const { accessToken, newRefreshToken } = yield this.authService.refreshToken(refreshToken);
            if (newRefreshToken) {
                res.cookie('refreshToken', newRefreshToken, (0, cookies_1.getRefreshTokenCookieOptions)());
            }
            return res
                .status(http_config_1.HTTPSTATUS.OK)
                .cookie('accessToken', accessToken, (0, cookies_1.getAccessTokenCookieOptions)())
                .json({
                message: 'Refresh access token successfully',
                accessToken,
            });
        }));
        this.verifyEmail = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { code } = auth_validator_1.verificationEmailSchema.parse(Object.assign({}, req === null || req === void 0 ? void 0 : req.body));
            yield this.authService.verifyEmail(code);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Email verified successfully',
            });
        }));
        this.forgotPassword = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const email = auth_validator_1.emailSchema.parse(req === null || req === void 0 ? void 0 : req.body.email);
            yield this.authService.forgotPassword(email);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Password reset email sent',
            });
        }));
        this.resetPassword = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const body = auth_validator_1.resetPasswordSchema.parse(req === null || req === void 0 ? void 0 : req.body);
            yield this.authService.resetPassword(body);
            return (0, cookies_1.clearAuthenticationCookies)(res).status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Reset password successfully',
            });
        }));
        this.logout = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const sessionId = req.sessionId;
            if (!sessionId) {
                throw new catch_errors_1.NotFoundException('Session is invalid');
            }
            yield this.authService.logout(sessionId);
            return (0, cookies_1.clearAuthenticationCookies)(res).status(http_config_1.HTTPSTATUS.OK).json({
                message: 'User logout successfully',
            });
        }));
        this.authService = authService;
    }
}
exports.AuthController = AuthController;
