"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicketSchema = exports.createTicketSchema = void 0;
const zod_1 = require("zod");
exports.createTicketSchema = zod_1.z.object({
    name: zod_1.z.string(),
    price: zod_1.z.number(),
    quantity: zod_1.z.number(),
    description: zod_1.z.string(),
    eventId: zod_1.z.string(),
});
exports.updateTicketSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    price: zod_1.z.number().optional(),
    quantity: zod_1.z.number().optional(),
    description: zod_1.z.string(),
    eventId: zod_1.z.string().optional(),
});
