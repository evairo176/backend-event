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
exports.asyncHandler = void 0;
const database_1 = require("../database/database");
const asyncHandler = (controller) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield controller(req, res, next);
    }
    catch (error) {
        // Simpan error ke database
        yield database_1.db.errorLog.create({
            data: {
                message: error.message || 'Unknown error',
                stack: error.stack,
                method: req.method,
                path: req.originalUrl,
                statusCode: res.statusCode || 500,
            },
        });
        next(error); // teruskan ke middleware error handling Express
    }
});
exports.asyncHandler = asyncHandler;
