"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFileSchema = void 0;
const zod_1 = require("zod");
exports.removeFileSchema = zod_1.z.object({
    fileUrl: zod_1.z.string(),
});
