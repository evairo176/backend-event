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
exports.encryptValue = void 0;
const crypto_1 = require("crypto");
const app_config_1 = require("../../config/app.config");
const encryptValue = (value) => __awaiter(void 0, void 0, void 0, function* () {
    const encrypted = yield (0, crypto_1.pbkdf2Sync)(value, app_config_1.config.CRYPTO.SECRET, 1000, 64, 'sha512').toString('hex');
    return encrypted;
});
exports.encryptValue = encryptValue;
// export const compareValue = async (value: string, hashedValue: string) => {
//   const compare = await bcrypt.compare(value, hashedValue);
//   return compare;
// };
