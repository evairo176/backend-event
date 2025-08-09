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
const database_1 = require("../../database/database");
const client_1 = require("@prisma/client");
//test
class AuthController {
    constructor(authService, mfaService) {
        this.register = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const body = auth_validator_1.registerSchema.parse(Object.assign({}, req === null || req === void 0 ? void 0 : req.body));
            const result = yield this.authService.register(body);
            return res.status(http_config_1.HTTPSTATUS.CREATED).json({
                message: 'User registered successfully',
                data: result.user,
            });
        }));
        this.companyRegister = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const body = auth_validator_1.companyRegisterSchema.parse(Object.assign({}, req === null || req === void 0 ? void 0 : req.body));
            const result = yield this.authService.companyRegister(Object.assign(Object.assign({}, body), { role: client_1.ROLE_USER.company_owner }));
            return res.status(http_config_1.HTTPSTATUS.CREATED).json({
                message: 'User registered successfully',
                data: result.user,
            });
        }));
        this.login = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userAgent = req === null || req === void 0 ? void 0 : req.headers['user-agent'];
            const body = auth_validator_1.loginSchema.parse(Object.assign(Object.assign({}, req === null || req === void 0 ? void 0 : req.body), { userAgent }));
            const code = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.code;
            const existingUser = yield this.authService.getProfile(body === null || body === void 0 ? void 0 : body.identifier);
            if (existingUser.mfaRequired && !code) {
                return res.status(http_config_1.HTTPSTATUS.OK).json({
                    message: 'Verify MFA authentication',
                    mfaRequired: existingUser.mfaRequired,
                    user: null,
                });
            }
            if (existingUser.mfaRequired && code) {
                const { user, accessToken, refreshToken } = yield this.mfaService.verifyMFAForLogin(code, existingUser.user.email, userAgent);
                return (0, cookies_1.setAuthenticationCookies)({
                    res,
                    accessToken,
                    refreshToken,
                })
                    .status(http_config_1.HTTPSTATUS.OK)
                    .json({
                    message: 'User login with 2fa successfully',
                    user,
                    accessToken,
                    refreshToken,
                    mfaRequired: existingUser.mfaRequired,
                });
            }
            const result = yield this.authService.login(body);
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
            const dataUser = yield database_1.db.user.findFirst({
                where: {
                    id: user === null || user === void 0 ? void 0 : user.id,
                },
                select: {
                    id: true,
                    fullname: true,
                    username: true,
                    email: true,
                    role: true,
                    profilePicture: true,
                    activationCode: true,
                    isEmailVerified: true,
                    createdAt: true,
                    updatedAt: true,
                    userPreferences: true,
                    balance: true,
                },
            });
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'get profile successfully',
                data: dataUser,
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
        this.updateProfile = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const body = auth_validator_1.updateProfileSchema.parse(req === null || req === void 0 ? void 0 : req.body);
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            yield this.authService.updateProfile(Object.assign(Object.assign({}, body), { userId: userId }));
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Update profile successfully',
            });
        }));
        this.updatePassword = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const body = auth_validator_1.updatePasswordSchema.parse(req === null || req === void 0 ? void 0 : req.body);
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            yield this.authService.updatePassword(Object.assign(Object.assign({}, body), { userId: userId }));
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Update password successfully',
            });
        }));
        this.authService = authService;
        this.mfaService = mfaService;
    }
}
exports.AuthController = AuthController;
