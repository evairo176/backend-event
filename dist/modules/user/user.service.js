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
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const catch_errors_1 = require("../../cummon/utils/catch-errors");
const database_1 = require("../../database/database");
const bcrypt_1 = require("../../cummon/utils/bcrypt");
const uuid_1 = require("../../cummon/utils/uuid");
const date_time_1 = require("../../cummon/utils/date-time");
const mailer_1 = require("../../mailers/mailer");
const app_config_1 = require("../../config/app.config");
const template_1 = require("../../mailers/templates/template");
class UserService {
    findUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
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
                },
            });
            return user || null;
        });
    }
    findAll(_a) {
        return __awaiter(this, arguments, void 0, function* ({ page = 1, limit = 10, search, userId, }) {
            const query = {
                NOT: {
                    id: userId,
                },
            };
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            if (search) {
                query.OR = [
                    {
                        fullname: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        email: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                ];
            }
            const [users, total] = yield Promise.all([
                database_1.db.user.findMany({
                    where: query,
                    skip,
                    take,
                    orderBy: { updatedAt: 'desc' },
                    select: {
                        id: true,
                        fullname: true,
                        email: true,
                        isEmailVerified: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true,
                        userPreferences: true,
                        companyId: true,
                        company: true,
                    },
                }),
                database_1.db.user.count({
                    where: query,
                }),
            ]);
            return {
                users,
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            };
        });
    }
    updateActivate(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, value }) {
            if (!userId) {
                throw new catch_errors_1.BadRequestException('Invalid user id provided', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
            }
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
                    status: true,
                    role: true,
                },
            });
            if (!user) {
                throw new catch_errors_1.BadRequestException('Invalid user id provided', "AUTH_USER_NOT_FOUND" /* ErrorCode.AUTH_USER_NOT_FOUND */);
            }
            if (user.status === 'NORMAL') {
                throw new catch_errors_1.BadRequestException('User is not allowed this action', "USER_NOT_ALLOWED" /* ErrorCode.USER_NOT_ALLOWED */);
            }
            if (user.status === 'APPROVE' && value) {
                throw new catch_errors_1.BadRequestException('User status already approved', "USER_STATUS_APPROVED" /* ErrorCode.USER_STATUS_APPROVED */);
            }
            if (user.status === 'REJECT' && !value) {
                throw new catch_errors_1.BadRequestException('User status already rejected', "USER_STATUS_REJECTED" /* ErrorCode.USER_STATUS_REJECTED */);
            }
            const updateUser = yield database_1.db.user.update({
                where: {
                    id: userId,
                },
                data: {
                    status: value === true ? 'APPROVE' : 'REJECT',
                },
            });
            if (!updateUser) {
                throw new catch_errors_1.BadRequestException('Failed to update password');
            }
            yield database_1.db.userHistoryUpdate.create({
                data: {
                    userId: updateUser.id,
                    message: `update status ${client_1.UserStatus.APPROVE}`,
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
                    status: true,
                    role: true,
                    company: true,
                },
            });
            return {
                user: showUser,
                status: showUser === null || showUser === void 0 ? void 0 : showUser.status,
            };
        });
    }
    addUser(registerData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fullname, username, email, companyId } = registerData;
            const existingCompany = yield database_1.db.company.findFirst({
                where: {
                    id: companyId,
                },
            });
            if (!existingCompany) {
                throw new catch_errors_1.BadRequestException('Company not found', "RESOURCE_NOT_FOUND" /* ErrorCode.RESOURCE_NOT_FOUND */);
            }
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
                    password: yield (0, bcrypt_1.encryptValue)(`${username}*12345`),
                    companyId: existingCompany.id,
                    status: 'APPROVE',
                    role: 'company_scanner',
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
                    company: true,
                    role: true,
                },
            });
            return {
                user: showNewUser,
            };
        });
    }
    companyFindAll(_a) {
        return __awaiter(this, arguments, void 0, function* ({ page = 1, limit = 10, search, companyId, userId, }) {
            const query = {
                companyId,
                NOT: {
                    id: userId,
                },
            };
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            if (search) {
                query.OR = [
                    {
                        fullname: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        email: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                ];
            }
            const [users, total] = yield Promise.all([
                database_1.db.user.findMany({
                    where: query,
                    skip,
                    take,
                    orderBy: { updatedAt: 'desc' },
                    select: {
                        id: true,
                        fullname: true,
                        email: true,
                        isEmailVerified: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true,
                        userPreferences: true,
                        companyId: true,
                        company: true,
                    },
                }),
                database_1.db.user.count({
                    where: query,
                }),
            ]);
            return {
                users,
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            };
        });
    }
}
exports.UserService = UserService;
