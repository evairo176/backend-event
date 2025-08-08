"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanVoucherSchema = void 0;
const zod_1 = require("zod");
exports.scanVoucherSchema = zod_1.z.object({
    code: zod_1.z.string(),
    scannedById: zod_1.z.string(),
    location: zod_1.z.string().optional(),
    device: zod_1.z.string().optional(),
});
