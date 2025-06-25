"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.regionController = exports.regionService = void 0;
const region_controller_1 = __importDefault(require("./region.controller"));
const region_service_1 = __importDefault(require("./region.service"));
const regionService = new region_service_1.default();
exports.regionService = regionService;
const regionController = new region_controller_1.default(regionService);
exports.regionController = regionController;
