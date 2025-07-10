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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMidtrans = void 0;
const axios_1 = __importDefault(require("axios"));
const app_config_1 = require("../../config/app.config");
const catch_errors_1 = require("./catch-errors");
class PaymentMidtrans {
    createLink(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield axios_1.default.post(`${app_config_1.config.MIDTRANS.TRANSACTION_URL}`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Basic ${Buffer.from(`${app_config_1.config.MIDTRANS.SERVER_KEY}:`).toString('base64')}`,
                },
            });
            if (result.status !== 201) {
                throw new catch_errors_1.BadRequestException('Payment failed');
            }
            return result === null || result === void 0 ? void 0 : result.data;
        });
    }
}
exports.PaymentMidtrans = PaymentMidtrans;
