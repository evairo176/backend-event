"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const http_config_1 = require("../config/http.config");
const app_error_1 = require("../cummon/utils/app-error");
const zod_1 = require("zod");
const cookies_1 = require("../cummon/utils/cookies");
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
    console.error(`Error occurred on PATH: ${req === null || req === void 0 ? void 0 : req.path}`, error);
    if (req.path === cookies_1.REFRESH_PATH) {
        (0, cookies_1.clearAuthenticationCookies)(res);
    }
    if (error instanceof SyntaxError) {
        return res.status(http_config_1.HTTPSTATUS.BAD_REQUEST).json({
            message: `Invalid JSON format, Please check your request body`,
        });
    }
    if (error instanceof zod_1.z.ZodError) {
        return formatZodError(res, error);
    }
    if (error instanceof app_error_1.AppError) {
        return res.status(error === null || error === void 0 ? void 0 : error.statusCode).json({
            message: error === null || error === void 0 ? void 0 : error.message,
            errorCode: error === null || error === void 0 ? void 0 : error.errorCode,
        });
    }
    return res.status(http_config_1.HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error',
        error: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error occurred',
    });
};
exports.errorHandler = errorHandler;
