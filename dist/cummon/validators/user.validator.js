"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateActivateSchema = void 0;
const zod_1 = require("zod");
exports.updateActivateSchema = zod_1.z.object({
    userId: zod_1.z.string(),
});
