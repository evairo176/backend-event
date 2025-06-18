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
exports.setupTTLIndex = setupTTLIndex;
const mongodb_1 = require("mongodb");
const app_config_1 = require("../config/app.config");
const uri = app_config_1.config.DATABASE_URL;
function setupTTLIndex() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(uri);
        yield client.connect();
        const db = client.db(); // otomatis pakai DB dari URI
        const collection = db.collection('ErrorLog');
        // Cek apakah TTL index sudah ada
        const indexes = yield collection.indexes();
        const hasTTL = indexes.some((i) => i.name === 'createdAt_1' && i.expireAfterSeconds === 60 * 60 * 24 * 7);
        if (!hasTTL) {
            yield collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });
            console.log('✅ TTL index for ErrorLog.createdAt dibuat');
        }
        else {
            console.log('ℹ️ TTL index untuk ErrorLog sudah ada');
        }
        yield client.close();
    });
}
