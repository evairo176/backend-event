"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const http_config_1 = require("../config/http.config");
const app_error_1 = require("../cummon/utils/app-error");
const zod_1 = require("zod");
const cookies_1 = require("../cummon/utils/cookies");
const client_1 = require("@prisma/client");
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
const errorHandler = (error, req, res, next) => {
    var _a, _b, _c;
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
        return formatZodError(res, error);
    }
    // Custom App error
    if (error instanceof app_error_1.AppError) {
        return res.status(error.statusCode).json({
            message: error.message,
            errorCode: error.errorCode,
        });
    }
    // Prisma: Unique constraint failed
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            return res.status(http_config_1.HTTPSTATUS.CONFLICT).json({
                message: `Duplicate field: ${Array.isArray((_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) ? error.meta.target.join(', ') : String((_b = error.meta) === null || _b === void 0 ? void 0 : _b.target)}`,
                code: error.code,
            });
        }
        // Example: Record not found
        if (error.code === 'P2025') {
            return res.status(http_config_1.HTTPSTATUS.NOT_FOUND).json({
                message: ((_c = error.meta) === null || _c === void 0 ? void 0 : _c.cause) || 'Record not found',
                code: error.code,
            });
        }
        // Default Prisma known request error
        return res.status(http_config_1.HTTPSTATUS.BAD_REQUEST).json({
            message: 'Prisma known error',
            code: error.code,
            meta: error.meta,
        });
    }
    // Prisma: Validation (e.g. wrong input type)
    if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        return res.status(http_config_1.HTTPSTATUS.BAD_REQUEST).json({
            message: 'Invalid input data. Prisma validation failed.',
            error: error.message,
        });
    }
    // Prisma: Unknown client error
    if (error instanceof client_1.Prisma.PrismaClientUnknownRequestError) {
        return res.status(http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
            message: 'An unknown error occurred in the database operation.',
            error: error.message,
        });
    }
    // Prisma: Initialization issues
    if (error instanceof client_1.Prisma.PrismaClientInitializationError) {
        return res.status(http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
            message: 'Prisma client failed to initialize.',
            error: error.message,
        });
    }
    // Fallback internal error
    return res.status(http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error',
        error: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error occurred',
    });
};
exports.errorHandler = errorHandler;
