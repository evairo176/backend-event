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
        errors,
    });
};
const logError = (_a) => __awaiter(void 0, [_a], void 0, function* ({ message, stack, req, statusCode, code, meta, }) {
    try {
        yield database_1.db.errorLog.create({
            data: {
                message,
                stack: typeof stack === 'string' ? stack : JSON.stringify(stack),
                method: req.method,
                path: req.originalUrl,
                statusCode,
                code,
                meta: meta ? JSON.stringify(meta) : undefined,
            },
        });
    }
    catch (logError) {
        console.error('Gagal menyimpan log error ke database:', logError);
    }
});
const errorHandler = (error, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    console.error(`Error occurred on PATH: ${req.path}`, error);
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
        yield logError({
            message: 'Validation failed',
            stack: error.issues,
            req,
            statusCode: http_config_1.HTTPSTATUS.BAD_REQUEST,
        });
        return formatZodError(res, error);
    }
    // Custom AppError
    if (error instanceof app_error_1.AppError) {
        yield logError({
            message: error.message,
            stack: error.stack,
            req,
            statusCode: error.statusCode,
            code: error.errorCode,
        });
        return res.status(error.statusCode).json({
            message: error.message,
            errorCode: error.errorCode,
        });
    }
    // Prisma Known Errors
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        let statusCode = http_config_1.HTTPSTATUS.BAD_REQUEST;
        let message = 'Prisma known error';
        if (error.code === 'P2002') {
            message = `Duplicate field: ${Array.isArray((_a = error.meta) === null || _a === void 0 ? void 0 : _a.target)
                ? error.meta.target.join(', ')
                : String((_b = error.meta) === null || _b === void 0 ? void 0 : _b.target)}`;
            statusCode = http_config_1.HTTPSTATUS.CONFLICT;
        }
        else if (error.code === 'P2025') {
            message = JSON.stringify((_c = error.meta) === null || _c === void 0 ? void 0 : _c.cause) || 'Record not found';
            statusCode = http_config_1.HTTPSTATUS.NOT_FOUND;
        }
        yield logError({
            message,
            stack: error.stack,
            req,
            statusCode,
            code: error.code,
            meta: error.meta,
        });
        return res.status(statusCode).json({
            message,
            code: error.code,
            meta: error.meta,
        });
    }
    // Prisma Validation Error
    if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        const message = 'Invalid input data. Prisma validation failed.';
        yield logError({
            message,
            stack: error.stack,
            req,
            statusCode: http_config_1.HTTPSTATUS.BAD_REQUEST,
        });
        return res.status(http_config_1.HTTPSTATUS.BAD_REQUEST).json({
            message,
            error: error.message,
        });
    }
    // Prisma Unknown Error
    if (error instanceof client_1.Prisma.PrismaClientUnknownRequestError) {
        const message = 'An unknown error occurred in the database operation.';
        yield logError({
            message,
            stack: error.stack,
            req,
            statusCode: http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR,
            meta: error.message,
        });
        return res.status(http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
            message,
            error: error.message,
        });
    }
    // Prisma Initialization Error
    if (error instanceof client_1.Prisma.PrismaClientInitializationError) {
        const message = 'Prisma client failed to initialize.';
        yield logError({
            message,
            stack: error.stack,
            req,
            statusCode: http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR,
            meta: error.message,
        });
        return res.status(http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
            message,
            error: error.message,
        });
    }
    // Fallback: Unknown error
    const fallbackMessage = (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error occurred';
    yield logError({
        message: 'Internal Server Error',
        stack: error.stack,
        req,
        statusCode: http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR,
        meta: fallbackMessage,
    });
    return res.status(http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error',
        error: fallbackMessage,
    });
});
exports.errorHandler = errorHandler;
