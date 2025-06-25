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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const database_1 = require("../database/database");
function importCSV(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = [];
        return new Promise((resolve, reject) => {
            fs_1.default.createReadStream(filePath)
                .pipe((0, csv_parser_1.default)({ headers: false }))
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', reject);
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // ✅ Urutan yang benar
        yield database_1.db.village.deleteMany({});
        yield database_1.db.district.deleteMany({});
        yield database_1.db.regency.deleteMany({});
        yield database_1.db.province.deleteMany({});
        // === Import Provinces (Bulk) ===
        const provinces = yield importCSV(path_1.default.join(__dirname, '../data/provinces.csv'));
        yield database_1.db.province.createMany({
            data: provinces.map((row) => {
                const [code, name] = Object.values(row);
                return { code, name };
            }),
        });
        // === Import Regencies (Bulk) ===
        const regenciesRaw = yield importCSV(path_1.default.join(__dirname, '../data/regencies.csv'));
        const provincesInDb = yield database_1.db.province.findMany({
            select: { id: true, code: true },
        });
        const provinceMap = new Map(provincesInDb.map((p) => [p.code, p.id]));
        const regenciesData = regenciesRaw.map((row) => {
            const [code, provinceCode, name] = Object.values(row);
            return {
                code,
                name,
                provinceId: provinceMap.get(provinceCode),
            };
        });
        yield database_1.db.regency.createMany({
            data: regenciesData,
        });
        // === Import Districts (Bulk) ===
        const districtsRaw = yield importCSV(path_1.default.join(__dirname, '../data/districts.csv'));
        const regenciesInDb = yield database_1.db.regency.findMany({
            select: { id: true, code: true },
        });
        const regencyMap = new Map(regenciesInDb.map((r) => [r.code, r.id]));
        const districtsData = districtsRaw
            .map((row) => {
            const [code, regencyCode, name] = Object.values(row);
            return {
                code,
                name,
                regencyId: regencyMap.get(regencyCode),
            };
        })
            .filter((d) => d.regencyId);
        yield database_1.db.district.createMany({
            data: districtsData,
        });
        // === Import Villages (Bulk) ===
        const villagesRaw = yield importCSV(path_1.default.join(__dirname, '../data/villages.csv'));
        const districtsInDb = yield database_1.db.district.findMany({
            select: { id: true, code: true },
        });
        const districtMap = new Map(districtsInDb.map((d) => [d.code, d.id]));
        const villagesData = villagesRaw
            .map((row) => {
            const [code, districtCode, name] = Object.values(row);
            return {
                code,
                name,
                districtId: districtMap.get(districtCode),
            };
        })
            .filter((v) => v.districtId);
        yield database_1.db.village.createMany({
            data: villagesData,
        });
        console.log('✅ Import selesai dengan createMany!');
    });
}
main()
    .catch((e) => {
    console.error('❌ Error:', e);
})
    .finally(() => database_1.db.$disconnect());
