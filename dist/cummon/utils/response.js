"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
exports.default = {
    success(res, data, message) {
        res.status(200).json({
            meta: {
                status: 200,
                message,
            },
            data,
        });
    },
    error(res, error, message) {
        if (error instanceof zod_1.ZodError) {
        }
    },
    unauthorized() { },
    pagination(res, data, pagination, message) {
        res.status(200).json({
            meta: {
                status: 200,
                message,
            },
            data,
            pagination,
        });
    },
};
