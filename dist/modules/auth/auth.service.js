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
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const app_config_1 = require("../../config/app.config");
const bcrypt_1 = require("../../cummon/utils/bcrypt");
const catch_errors_1 = require("../../cummon/utils/catch-errors");
const uuid_1 = require("../../cummon/utils/uuid");
const database_1 = require("../../database/database");
const mailer_1 = require("../../mailers/mailer");
const template_1 = require("../../mailers/templates/template");
const date_time_1 = require("../../cummon/utils/date-time");
const jwt_1 = require("../../cummon/utils/jwt");
class AuthService {
    register(registerData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fullname, username, email, password } = registerData;
            const existingUser = yield database_1.db.user.findFirst({
                where: {
                    email,
                },
            });
            if (existingUser) {
                throw new catch_errors_1.BadRequestException('User already exists with this email', "AUTH_EMAIL_ALREADY_EXISTS" /* ErrorCode.AUTH_EMAIL_ALREADY_EXISTS */);
            }
            if (username) {
                const existingUsername = yield database_1.db.user.findFirst({
                    where: {
                        username,
                    },
                });
                if (existingUsername) {
                    throw new catch_errors_1.BadRequestException('Username already exists', "AUTH_USERNAME_ALREADY_EXISTS" /* ErrorCode.AUTH_USERNAME_ALREADY_EXISTS */);
                }
            }
            const newUser = yield database_1.db.user.create({
                data: {
                    fullname,
                    username,
                    email,
                    password: yield (0, bcrypt_1.encryptValue)(password),
                },
            });
            const userId = newUser.id;
            const verification = yield database_1.db.verificationCode.create({
                data: {
                    userId,
                    code: (0, uuid_1.generateUniqueCode)(),
                    type: client_1.VerificationType.EMAIL_VERIFICATION,
                    expiresAt: (0, date_time_1.fortyFiveMinutesFromNow)(),
                },
            });
            // send email
            const verificationUrl = `${app_config_1.config.APP_ORIGIN}/confirm-account?code=${verification.code}`;
            yield (0, mailer_1.sendEmail)(Object.assign({ to: newUser.email }, (0, template_1.verifyEmailTemplate)(verificationUrl)));
            yield database_1.db.userPreferences.create({
                data: {
                    userId,
                    enable2FA: false,
                    emailNotification: true,
                },
            });
            const showNewUser = yield database_1.db.user.findFirst({
                where: {
                    id: userId,
                },
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    isEmailVerified: true,
                    createdAt: true,
                    updatedAt: true,
                    userPreferences: true,
                },
            });
            return {
                user: showNewUser,
            };
        });
    }
    login(loginData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            //   public async register(register: RegisterDto) {
            const { identifier, password, userAgent } = loginData;
            const user = yield database_1.db.user.findFirst({
                where: {
                    OR: [
                        {
                            username: identifier,
                        },
                        {
                            email: identifier,
                        },
                    ],
                },
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    isEmailVerified: true,
                    createdAt: true,
                    updatedAt: true,
                    userPreferences: true,
                    password: true, // Include password for validation
                },
            });
            if (!user) {
                throw new catch_errors_1.BadRequestException('Invalid email provided', "AUTH_USER_NOT_FOUND" /* ErrorCode.AUTH_USER_NOT_FOUND */);
            }
            const isPasswordValid = (yield (0, bcrypt_1.encryptValue)(password)) === user.password;
            if (!isPasswordValid) {
                throw new catch_errors_1.BadRequestException('Invalid password provided', "AUTH_USER_NOT_FOUND" /* ErrorCode.AUTH_USER_NOT_FOUND */);
            }
            if ((_a = user.userPreferences) === null || _a === void 0 ? void 0 : _a.enable2FA) {
                return {
                    user: null,
                    mfaRequired: true,
                    refreshToken: '',
                    accessToken: '',
                };
            }
            const session = yield database_1.db.session.create({
                data: {
                    userId: user.id,
                    userAgent: userAgent !== null && userAgent !== void 0 ? userAgent : null,
                    expiredAt: (0, date_time_1.thirtyDaysFromNow)(),
                },
            });
            const accessToken = (0, jwt_1.signJwtToken)({
                userId: user.id,
                sessionId: session.id,
            });
            const refreshToken = (0, jwt_1.signJwtToken)({
                sessionId: session.id,
            }, jwt_1.refreshTokenSignOptions);
            const showUser = yield database_1.db.user.findFirst({
                where: {
                    id: user.id,
                },
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    isEmailVerified: true,
                    createdAt: true,
                    updatedAt: true,
                    userPreferences: true,
                },
            });
            return {
                user: showUser,
                accessToken,
                refreshToken,
                mfaRequired: false,
            };
        });
    }
}
exports.AuthService = AuthService;
