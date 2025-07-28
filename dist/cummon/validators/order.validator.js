"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderSchema = void 0;
const zod_1 = require("zod");
exports.createOrderSchema = zod_1.z.array(zod_1.z.object({
    quantity: zod_1.z.number(),
    eventId: zod_1.z.string(),
    ticketId: zod_1.z.string(),
}));
