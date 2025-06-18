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
exports.scheduleErrorLogCleanup = scheduleErrorLogCleanup;
// lib/errorCleaner.ts
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = require("../database/database");
function scheduleErrorLogCleanup() {
    // setiap 1 jam scheduler akan berjalan
    node_cron_1.default.schedule('0 * * * *', () => __awaiter(this, void 0, void 0, function* () {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 hari lalu
        try {
            const result = yield database_1.db.errorLog.deleteMany({
                where: {
                    createdAt: {
                        lt: oneWeekAgo, // hanya hapus yang lebih lama dari 7 hari
                    },
                },
            });
            console.log(`🧹 ErrorLog cleanup: ${result.count} records deleted.`);
        }
        catch (error) {
            console.error('❌ Gagal menghapus ErrorLog:', error);
        }
    }));
    console.log('⏱️ Cron job ErrorLog cleanup aktif (hapus data lebih dari 7 hari setiap 1 jam)');
}
