"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaController = exports.mediaService = void 0;
const media_controller_1 = require("./media.controller");
const media_service_1 = require("./media.service");
const mediaService = new media_service_1.MediaService();
exports.mediaService = mediaService;
const mediaController = new media_controller_1.MediaController(mediaService);
exports.mediaController = mediaController;
