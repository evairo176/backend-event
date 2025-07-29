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
exports.Dashboard = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const isoWeek_1 = __importDefault(require("dayjs/plugin/isoWeek"));
const database_1 = require("../../database/database");
dayjs_1.default.extend(isoWeek_1.default);
class Dashboard {
    getOrderSummaryByTime(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = (0, dayjs_1.default)();
            let startDate;
            let groupFormat = 'DD MMM'; // default
            switch (filter) {
                case 'hourly':
                    startDate = now.startOf('hour').toDate(); // hanya jam ini saja
                    groupFormat = 'HH:mm';
                    break;
                case 'daily':
                    startDate = now.startOf('day').toDate(); // hari ini
                    groupFormat = 'HH:mm'; // tampilkan per jam
                    break;
                case 'weekly':
                    startDate = now.startOf('week').toDate();
                    groupFormat = 'DD MMM';
                    break;
                case 'monthly':
                    startDate = now.startOf('month').toDate();
                    groupFormat = 'DD MMM';
                    break;
                case 'yearly':
                    startDate = now.startOf('year').toDate();
                    groupFormat = 'MMM'; // Per bulan (nama bulan)
                    break;
                case 'all':
                    // Jangan batasi startDate, tapi group per bulan-tahun
                    startDate = undefined;
                    groupFormat = 'DD MMM YYYY';
                    break;
            }
            const orders = yield database_1.db.order.findMany({
                where: Object.assign({ status: 'COMPLETED' }, (startDate && {
                    createdAt: {
                        gte: startDate,
                    },
                })),
                select: {
                    total: true,
                    createdAt: true,
                },
            });
            const result = {};
            for (const order of orders) {
                const key = (0, dayjs_1.default)(order.createdAt).format(groupFormat);
                if (!result[key]) {
                    result[key] = { total: 0, count: 0 };
                }
                result[key].total += order.total;
                result[key].count += 1;
            }
            const formatted = Object.entries(result).map(([date, { total, count }]) => ({
                date,
                total,
                count,
            }));
            formatted.sort((a, b) => (0, dayjs_1.default)(a.date, groupFormat).valueOf() -
                (0, dayjs_1.default)(b.date, groupFormat).valueOf());
            return formatted;
        });
    }
}
exports.Dashboard = Dashboard;
