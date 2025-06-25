"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventSchema = void 0;
const zod_1 = require("zod");
exports.createEventSchema = zod_1.z.object({
    name: zod_1.z.string(),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
    description: zod_1.z.string(),
    banner: zod_1.z.string(),
    isFeatured: zod_1.z.boolean(),
    isOnline: zod_1.z.boolean(),
    isPublish: zod_1.z.boolean().default(false),
    region: zod_1.z.number(),
    coordinates: zod_1.z.array(zod_1.z.number()),
    categoryId: zod_1.z.string(),
});
