"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const catch_errors_1 = require("../cummon/utils/catch-errors");
const http_config_1 = require("../config/http.config");
exports.default = (roles) => {
    return (req, res, next) => {
        var _a;
        const role = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (!role || !roles.includes(role)) {
            throw new catch_errors_1.HttpException('Role not found', http_config_1.HTTPSTATUS.FORBIDDEN, "ACCESS_FORBIDDEN" /* ErrorCode.ACCESS_FORBIDDEN */);
        }
        next();
    };
};
