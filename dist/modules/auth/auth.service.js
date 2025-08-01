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
const http_config_1 = require("../../config/http.config");
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
            const verificationUrl = `${app_config_1.config.APP_ORIGIN}/auth/confirm-account?code=${verification.code}`;
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
                throw new catch_errors_1.BadRequestException('Invalid username or email provided', "AUTH_USER_NOT_FOUND" /* ErrorCode.AUTH_USER_NOT_FOUND */);
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
                    role: true,
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
    refreshToken(refreshTokenData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { payload } = (0, jwt_1.verifyJwtToken)(refreshTokenData, {
                secret: jwt_1.refreshTokenSignOptions.secret,
            });
            if (!payload) {
                throw new catch_errors_1.UnauthorizedException('Invalid refresh token');
            }
            const session = yield database_1.db.session.findFirst({
                where: {
                    id: payload.sessionId,
                },
            });
            const now = Date.now();
            if (!session) {
                throw new catch_errors_1.UnauthorizedException('Session does not exist');
            }
            if (session.expiredAt.getTime() <= now) {
                throw new catch_errors_1.UnauthorizedException('Session expired');
            }
            const sessionRequireRefresh = session.expiredAt.getTime() - now <= date_time_1.ONE_DAY_IN_MS;
            if (sessionRequireRefresh) {
                yield database_1.db.session.update({
                    where: {
                        id: session.id,
                    },
                    data: {
                        expiredAt: (0, date_time_1.calculateExpirationDate)(app_config_1.config.JWT.REFRESH_EXPIRES_IN),
                    },
                });
            }
            const newRefreshToken = sessionRequireRefresh
                ? (0, jwt_1.signJwtToken)({ sessionId: session.id }, jwt_1.refreshTokenSignOptions)
                : undefined;
            const accessToken = (0, jwt_1.signJwtToken)({
                userId: session.userId,
                sessionId: session.id,
            });
            return {
                accessToken,
                newRefreshToken,
            };
        });
    }
    verifyEmail(code) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log('Received code:', code);
            // Cari berdasarkan code saja dulu
            const validCode = yield database_1.db.verificationCode.findFirst({
                where: {
                    code,
                },
            });
            // const verificationCodes = await db.verificationCode.findMany({});
            // console.log('All verification codes:', verificationCodes);
            if (!validCode) {
                throw new catch_errors_1.BadRequestException('Kode verifikasi tidak ditemukan');
            }
            if (validCode.type !== "EMAIL_VERIFICATION" /* VerificationEnum.EMAIL_VERIFICATION */) {
                throw new catch_errors_1.BadRequestException('Tipe kode verifikasi tidak valid');
            }
            // if (validCode.expiresAt <= new Date()) {
            //   throw new BadRequestException('Kode verifikasi telah kedaluwarsa');
            // }
            const updateUser = yield database_1.db.user.update({
                where: {
                    id: validCode.userId,
                },
                data: {
                    isEmailVerified: true,
                },
            });
            if (!updateUser) {
                throw new catch_errors_1.BadRequestException('Unable to verify email address', "VERIFICATION_ERROR" /* ErrorCode.VERIFICATION_ERROR */);
            }
            yield database_1.db.verificationCode.delete({
                where: {
                    id: validCode.id,
                },
            });
            return {
                user: updateUser,
            };
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield database_1.db.user.findFirst({
                where: {
                    email,
                },
            });
            if (!user) {
                throw new catch_errors_1.NotFoundException('User not found');
            }
            // check mail rate limit is 2 emails per 3 or 10 min
            const timeAgo = (0, date_time_1.threeMinutesAgo)();
            const maxAttempts = 2;
            const count = yield database_1.db.verificationCode.count({
                where: {
                    userId: user.id,
                    type: "PASSWORD_RESET" /* VerificationEnum.PASSWORD_RESET */,
                    createdAt: {
                        gt: timeAgo,
                    },
                },
            });
            if (count >= maxAttempts) {
                throw new catch_errors_1.HttpException('To many request, try again later', http_config_1.HTTPSTATUS.TOO_MANY_REQUESTS, "AUTH_TOO_MANY_ATTEMPTS" /* ErrorCode.AUTH_TOO_MANY_ATTEMPTS */);
            }
            const expiresAt = (0, date_time_1.anHourFromNow)();
            const validCode = yield database_1.db.verificationCode.create({
                data: {
                    userId: user.id,
                    type: "PASSWORD_RESET" /* VerificationEnum.PASSWORD_RESET */,
                    expiresAt,
                    code: (0, uuid_1.generateUniqueCode)(),
                },
            });
            const resetLink = `${app_config_1.config.APP_ORIGIN}/reset-password?code=${validCode.code}&exp=${expiresAt.getTime()}`;
            const { data, error } = yield (0, mailer_1.sendEmail)(Object.assign({ to: user.email }, (0, template_1.passwordResetTemplate)(resetLink)));
            if (!(data === null || data === void 0 ? void 0 : data.id)) {
                throw new catch_errors_1.InternalServerException(`${error === null || error === void 0 ? void 0 : error.name} ${error === null || error === void 0 ? void 0 : error.message}`);
            }
            return {
                url: resetLink,
                emailId: data.id,
            };
        });
    }
    resetPassword(_a) {
        return __awaiter(this, arguments, void 0, function* ({ password, verificationCode }) {
            const validCode = yield database_1.db.verificationCode.findFirst({
                where: {
                    code: verificationCode,
                    type: "PASSWORD_RESET" /* VerificationEnum.PASSWORD_RESET */,
                    expiresAt: {
                        gt: new Date(),
                    },
                },
            });
            if (!validCode) {
                throw new catch_errors_1.NotFoundException('Invalid or expred verification code');
            }
            const hashPassword = yield (0, bcrypt_1.encryptValue)(password);
            const updateUser = yield database_1.db.user.update({
                where: {
                    id: validCode.userId,
                },
                data: {
                    password: hashPassword,
                },
            });
            if (!updateUser) {
                throw new catch_errors_1.BadRequestException('Failed to reset password');
            }
            yield database_1.db.verificationCode.delete({
                where: {
                    id: validCode.id,
                },
            });
            yield database_1.db.session.deleteMany({
                where: {
                    userId: updateUser.id,
                },
            });
            const showUser = yield database_1.db.user.findFirst({
                where: {
                    id: updateUser.id,
                },
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    isEmailVerified: true,
                    createdAt: true,
                    updatedAt: true,
                    userPreferences: true,
                    sessions: true,
                },
            });
            return {
                user: showUser,
            };
        });
    }
    logout(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield database_1.db.session.deleteMany({
                where: {
                    id: sessionId,
                },
            });
        });
    }
    updateProfile(_a) {
        return __awaiter(this, arguments, void 0, function* ({ fullname, profilePicture, userId, }) {
            const oldUser = yield database_1.db.user.findFirst({
                where: {
                    id: userId,
                },
            });
            if (!oldUser) {
                throw new catch_errors_1.BadRequestException('Failed to update profile');
            }
            if (oldUser.fullname === fullname &&
                oldUser.profilePicture === profilePicture) {
                throw new catch_errors_1.BadRequestException('No changes detected');
            }
            const updateUser = yield database_1.db.user.update({
                where: {
                    id: userId,
                },
                data: {
                    fullname: fullname ? fullname : oldUser === null || oldUser === void 0 ? void 0 : oldUser.fullname,
                    profilePicture,
                },
            });
            if (!updateUser) {
                throw new catch_errors_1.BadRequestException('Failed to update profile');
            }
            yield database_1.db.userHistoryUpdate.create({
                data: {
                    userId: updateUser.id,
                    oldFullname: oldUser.fullname,
                    oldProfilePicture: oldUser.profilePicture,
                    fullname,
                    profilePicture,
                    message: 'User updated profile',
                },
            });
            const showUser = yield database_1.db.user.findFirst({
                where: {
                    id: updateUser.id,
                },
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    isEmailVerified: true,
                    createdAt: true,
                    updatedAt: true,
                    userPreferences: true,
                    sessions: true,
                },
            });
            return {
                user: showUser,
            };
        });
    }
    updatePassword(_a) {
        return __awaiter(this, arguments, void 0, function* ({ oldPassword, password, userId, }) {
            const user = yield database_1.db.user.findFirst({
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
                    password: true, // Include password for validation
                },
            });
            if (!user) {
                throw new catch_errors_1.BadRequestException('Invalid user id provided', "AUTH_USER_NOT_FOUND" /* ErrorCode.AUTH_USER_NOT_FOUND */);
            }
            const hashOldPassword = yield (0, bcrypt_1.encryptValue)(oldPassword);
            const isPasswordValid = hashOldPassword === user.password;
            if (!isPasswordValid) {
                throw new catch_errors_1.BadRequestException('Invalid current password', "AUTH_USER_NOT_FOUND" /* ErrorCode.AUTH_USER_NOT_FOUND */);
            }
            const newHashPassword = yield (0, bcrypt_1.encryptValue)(password);
            const updateUser = yield database_1.db.user.update({
                where: {
                    id: userId,
                },
                data: {
                    password: newHashPassword,
                },
            });
            if (!updateUser) {
                throw new catch_errors_1.BadRequestException('Failed to update password');
            }
            yield database_1.db.userHistoryUpdate.create({
                data: {
                    userId: updateUser.id,
                    message: 'User updated password',
                },
            });
            const showUser = yield database_1.db.user.findFirst({
                where: {
                    id: updateUser.id,
                },
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    isEmailVerified: true,
                    createdAt: true,
                    updatedAt: true,
                    userPreferences: true,
                    sessions: true,
                },
            });
            return {
                user: showUser,
            };
        });
    }
    getProfile(identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
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
                throw new catch_errors_1.BadRequestException('Invalid username or email provided', "AUTH_USER_NOT_FOUND" /* ErrorCode.AUTH_USER_NOT_FOUND */);
            }
            const mfaRequired = (_a = user === null || user === void 0 ? void 0 : user.userPreferences) === null || _a === void 0 ? void 0 : _a.enable2FA;
            return {
                user: user,
                mfaRequired: mfaRequired,
                refreshToken: '',
                accessToken: '',
            };
        });
    }
}
exports.AuthService = AuthService;
