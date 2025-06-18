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
exports.SessionService = void 0;
const catch_errors_1 = require("../../cummon/utils/catch-errors");
const database_1 = require("../../database/database");
class SessionService {
    getAllSession(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessions = yield database_1.db.session.findMany({
                where: {
                    userId,
                    expiredAt: {
                        gt: new Date(Date.now()),
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    id: true,
                    userId: true,
                    userAgent: true,
                    createdAt: true,
                    expiredAt: true,
                },
            });
            return {
                sessions,
            };
        });
    }
    getSessionById(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield database_1.db.session.findFirst({
                where: {
                    id: sessionId,
                },
                select: {
                    id: true,
                    userId: true,
                    userAgent: true,
                    createdAt: true,
                    expiredAt: true,
                    user: {
                        select: {
                            id: true,
                            fullname: true,
                            email: true,
                            isEmailVerified: true,
                            createdAt: true,
                            updatedAt: true,
                            userPreferences: {
                                select: {
                                    enable2FA: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!session) {
                throw new catch_errors_1.NotFoundException('Session not found');
            }
            return {
                user: session.user,
            };
        });
    }
    deleteSession(sessionId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedSession = yield database_1.db.session.delete({
                where: {
                    id: sessionId,
                    userId,
                },
            });
            if (!deletedSession) {
                throw new catch_errors_1.NotFoundException('Session not found');
            }
            return;
        });
    }
}
exports.SessionService = SessionService;
