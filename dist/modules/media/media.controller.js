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
exports.MediaController = void 0;
const catch_errors_1 = require("../../cummon/utils/catch-errors");
const http_config_1 = require("../../config/http.config");
const media_validator_1 = require("../../cummon/validators/media.validator");
const async_handler_middleware_1 = require("../../middlewares/async-handler.middleware");
class MediaController {
    constructor(mediaService) {
        this.single = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.file) {
                throw new catch_errors_1.BadRequestException('File is not exist');
            }
            const result = yield this.mediaService.single(req.file);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success upload a file',
                data: result,
            });
        }));
        this.multiple = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.files || req.files.length === 0) {
                throw new catch_errors_1.BadRequestException('Files is not exist');
            }
            const result = yield this.mediaService.multiple(req.files);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success upload a files',
                data: result,
            });
        }));
        this.remove = (0, async_handler_middleware_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { fileUrl } = media_validator_1.removeFileSchema.parse(Object.assign({}, req === null || req === void 0 ? void 0 : req.body));
            const result = yield this.mediaService.remove(fileUrl);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: 'Success remove file',
                data: result,
            });
        }));
        this.mediaService = mediaService;
    }
}
exports.MediaController = MediaController;
