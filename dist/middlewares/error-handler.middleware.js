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
exports.errorHandler = void 0;
const http_config_1 = require("../config/http.config");
const app_error_1 = require("../cummon/utils/app-error");
const zod_1 = require("zod");
const cookies_1 = require("../cummon/utils/cookies");
const client_1 = require("@prisma/client");
const database_1 = require("../database/database");
const formatZodError = (res, error) => {
    var _a;
    const errors = (_a = error === null || error === void 0 ? void 0 : error.issues) === null || _a === void 0 ? void 0 : _a.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
    }));
    return res.status(http_config_1.HTTPSTATUS.BAD_REQUEST).json({
        message: 'Validation failed',
        errors: errors,
    });
};
const errorHandler = (error, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    console.error(`Error occurred on PATH: ${req === null || req === void 0 ? void 0 : req.path}`, error);
    if (req.path === cookies_1.REFRESH_PATH) {
        (0, cookies_1.clearAuthenticationCookies)(res);
    }
    // JSON syntax error
    if (error instanceof SyntaxError) {
        return res.status(http_config_1.HTTPSTATUS.BAD_REQUEST).json({
            message: 'Invalid JSON format, Please check your request body',
        });
    }
    // Zod validation error
    if (error instanceof zod_1.z.ZodError) {
        yield database_1.db.errorLog.create({
            data: {
                message: 'Validation failed',
                stack: JSON.stringify(error.issues),
                method: req.method,
                path: req.originalUrl,
                statusCode: http_config_1.HTTPSTATUS.BAD_REQUEST,
            },
        });
        return formatZodError(res, error);
    }
    // Custom App error
    if (error instanceof app_error_1.AppError) {
        yield database_1.db.errorLog.create({
            data: {
                message: error.message,
                stack: error.stack,
                method: req.method,
                path: req.originalUrl,
                statusCode: error.statusCode,
                code: error.errorCode,
            },
        });
        return res.status(error.statusCode).json({
            message: error.message,
            errorCode: error.errorCode,
        });
    }
    // Prisma: Unique constraint failed
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            const fields = Array.isArray((_a = error.meta) === null || _a === void 0 ? void 0 : _a.target)
                ? error.meta.target.join(', ')
                : String((_b = error.meta) === null || _b === void 0 ? void 0 : _b.target);
            yield database_1.db.errorLog.create({
                data: {
                    message: `Duplicate field: ${fields}`,
                    stack: error.stack,
                    method: req.method,
                    path: req.originalUrl,
                    statusCode: http_config_1.HTTPSTATUS.CONFLICT,
                    code: error.code,
                    meta: JSON.stringify(error.meta),
                },
            });
            return res.status(http_config_1.HTTPSTATUS.CONFLICT).json({
                message: `Duplicate field: ${Array.isArray((_c = error.meta) === null || _c === void 0 ? void 0 : _c.target) ? error.meta.target.join(', ') : String((_d = error.meta) === null || _d === void 0 ? void 0 : _d.target)}`,
                code: error.code,
            });
        }
        // Example: Record not found
        if (error.code === 'P2025') {
            yield database_1.db.errorLog.create({
                data: {
                    message: JSON.stringify((_e = error.meta) === null || _e === void 0 ? void 0 : _e.cause) || `Record not found`,
                    stack: error.stack,
                    method: req.method,
                    path: req.originalUrl,
                    statusCode: http_config_1.HTTPSTATUS.NOT_FOUND,
                    code: error.code,
                    meta: JSON.stringify(error.meta),
                },
            });
            return res.status(http_config_1.HTTPSTATUS.NOT_FOUND).json({
                message: ((_f = error.meta) === null || _f === void 0 ? void 0 : _f.cause) || 'Record not found',
                code: error.code,
            });
        }
        yield database_1.db.errorLog.create({
            data: {
                message: 'Prisma known error',
                stack: error.stack,
                method: req.method,
                path: req.originalUrl,
                statusCode: http_config_1.HTTPSTATUS.BAD_REQUEST,
                code: error.code,
                meta: JSON.stringify(error.meta),
            },
        });
        // Default Prisma known request error
        return res.status(http_config_1.HTTPSTATUS.BAD_REQUEST).json({
            message: 'Prisma known error',
            code: error.code,
            meta: error.meta,
        });
    }
    // Prisma: Validation (e.g. wrong input type)
    if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        yield database_1.db.errorLog.create({
            data: {
                message: 'Invalid input data. Prisma validation failed.',
                stack: error.stack,
                method: req.method,
                path: req.originalUrl,
                statusCode: http_config_1.HTTPSTATUS.BAD_REQUEST,
            },
        });
        return res.status(http_config_1.HTTPSTATUS.BAD_REQUEST).json({
            message: 'Invalid input data. Prisma validation failed.',
            error: error.message,
        });
    }
    // Prisma: Unknown client error
    if (error instanceof client_1.Prisma.PrismaClientUnknownRequestError) {
        yield database_1.db.errorLog.create({
            data: {
                message: 'An unknown error occurred in the database operation.',
                stack: error.stack,
                method: req.method,
                path: req.originalUrl,
                statusCode: http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR,
                meta: error.message,
            },
        });
        return res.status(http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
            message: 'An unknown error occurred in the database operation.',
            error: error.message,
        });
    }
    // Prisma: Initialization issues
    if (error instanceof client_1.Prisma.PrismaClientInitializationError) {
        yield database_1.db.errorLog.create({
            data: {
                message: 'Prisma client failed to initialize.',
                stack: error.stack,
                method: req.method,
                path: req.originalUrl,
                statusCode: http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR,
                meta: error.message,
            },
        });
        return res.status(http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
            message: 'Prisma client failed to initialize.',
            error: error.message,
        });
    }
    yield database_1.db.errorLog.create({
        data: {
            message: 'Internal Server Error',
            stack: error.stack,
            method: req.method,
            path: req.originalUrl,
            statusCode: http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR,
            meta: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error occurred',
        },
    });
    // Fallback internal error
    return res.status(http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error',
        error: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error occurred',
    });
});
exports.errorHandler = errorHandler;
