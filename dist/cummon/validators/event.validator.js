"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventSchema = exports.createEventSchema = void 0;
const zod_1 = require("zod");
exports.createEventSchema = zod_1.z.object({
    name: zod_1.z.string(),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
    description: zod_1.z.string(),
    banner: zod_1.z.string(),
    isFeatured: zod_1.z.boolean(),
    isOnline: zod_1.z.boolean(),
    isPublished: zod_1.z.boolean().default(false),
    region: zod_1.z.string(),
    address: zod_1.z.string(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    categoryId: zod_1.z.string(),
});
exports.updateEventSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    banner: zod_1.z.string().optional(),
    isFeatured: zod_1.z.boolean().optional(),
    isOnline: zod_1.z.boolean().optional(),
    isPublished: zod_1.z.boolean().default(false).optional(),
    region: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    latitude: zod_1.z.number().optional().optional(),
    longitude: zod_1.z.number().optional().optional(),
    categoryId: zod_1.z.string().optional(),
});
