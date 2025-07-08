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
const database_1 = require("../../database/database");
class RegionService {
    findByCity(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = database_1.db.regency.findMany({
                where: {
                    name: {
                        contains: name,
                        mode: 'insensitive',
                    },
                },
                //   include: {
                //     province: true,
                //     districts: {
                //       include: {
                //         villages: true,
                //       },
                //     },
                //   },
            });
            return result;
        });
    }
    getAllProvinces() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = database_1.db.province.findMany({
                include: {
                    regencies: true,
                },
            });
            return result;
        });
    }
    getProvince(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = database_1.db.province.findFirst({
                where: { code },
                include: {
                    regencies: {
                        include: {
                            districts: {
                                include: {
                                    villages: true,
                                },
                            },
                        },
                    },
                },
            });
            return result;
        });
    }
    getRegency(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = database_1.db.regency.findFirst({
                where: { code },
            });
            return result;
        });
    }
    getDistrict(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = database_1.db.district.findFirst({
                where: { code },
                include: {
                    regency: {
                        include: {
                            province: true,
                        },
                    },
                    villages: true,
                },
            });
            return result;
        });
    }
    getVillage(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = database_1.db.village.findFirst({
                where: { code },
                include: {
                    district: {
                        include: {
                            regency: {
                                include: {
                                    province: true,
                                },
                            },
                        },
                    },
                },
            });
            return result;
        });
    }
}
exports.default = RegionService;
