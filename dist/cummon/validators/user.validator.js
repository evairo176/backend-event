"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateActivateSchema = exports.addUserSchema = exports.userNameSchema = exports.emailSchema = void 0;
const zod_1 = require("zod");
exports.emailSchema = zod_1.z.string().trim().email().min(1).max(255);
exports.userNameSchema = zod_1.z.string().trim().min(1).max(50);
exports.addUserSchema = zod_1.z.object({
    fullname: zod_1.z.string().trim().min(1).max(255),
    username: exports.userNameSchema,
    email: exports.emailSchema,
});
exports.updateActivateSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    value: zod_1.z.boolean(),
});
