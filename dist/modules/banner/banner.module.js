"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannerController = exports.bannerService = void 0;
const banner_controller_1 = require("./banner.controller");
const banner_service_1 = require("./banner.service");
const bannerService = new banner_service_1.BannerService();
exports.bannerService = bannerService;
const bannerController = new banner_controller_1.BannerController(bannerService);
exports.bannerController = bannerController;
