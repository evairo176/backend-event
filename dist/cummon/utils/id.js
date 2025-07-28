"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderId = generateOrderId;
const date_fns_1 = require("date-fns");
const nanoid_1 = require("nanoid");
function generateOrderId(prefixValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const code = prefixValue !== null && prefixValue !== void 0 ? prefixValue : 'ORD';
        const now = new Date();
        // Allowed characters: a-z and 1-9 + 0 (no special characters or uppercase)
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        // Generate function with desired length, e.g. 10 characters
        const nanoid = (0, nanoid_1.customAlphabet)(alphabet, 8);
        // Generate a new ID
        const id = nanoid();
        const dateCode = (0, date_fns_1.format)(now, 'yyMMdd');
        const prefix = `${code}-${dateCode}`; // contoh: ORD-250710
        // const lastOrder = await db.order.findFirst({
        //   where: {
        //     orderId: {
        //       startsWith: prefix,
        //     },
        //   },
        //   orderBy: {
        //     createdAt: 'desc', // atau orderId: 'desc' jika format bisa di-sort
        //   },
        //   select: {
        //     orderId: true,
        //   },
        // });
        // let lastNumber = 0;
        // if (lastOrder?.orderId) {
        //   const parts = lastOrder.orderId.split('-'); // contoh: ['ORD', '250710', '00017']
        //   const lastPart = parts[2];
        //   if (lastPart && /^\d+$/.test(lastPart)) {
        //     lastNumber = parseInt(lastPart, 10);
        //   }
        // }
        // const newNumber = lastNumber + 1;
        // const uniqId = String(newNumber).padStart(5, '0'); // hasil: 00018
        const orderId = `${prefix}-${id}`;
        return orderId;
    });
}
