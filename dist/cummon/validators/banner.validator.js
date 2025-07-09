"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBannerSchema = exports.createBannerSchema = void 0;
const zod_1 = require("zod");
exports.createBannerSchema = zod_1.z.object({
    title: zod_1.z.string(),
    image: zod_1.z.string(),
    isShow: zod_1.z.boolean(),
});
exports.updateBannerSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
    isShow: zod_1.z.boolean().optional(),
});
