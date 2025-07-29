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
const cloudinary_1 = require("cloudinary");
const app_config_1 = require("../../config/app.config");
// Configuration
cloudinary_1.v2.config({
    cloud_name: app_config_1.config.CLOUDINARY_CLOUD.NAME,
    api_key: app_config_1.config.CLOUDINARY_CLOUD.API_KEY,
    api_secret: app_config_1.config.CLOUDINARY_CLOUD.API_SECRET, // Click 'View API Keys' above to copy your API secret
});
const toDataURL = (file) => {
    const base64 = Buffer.from(file.buffer).toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;
    return dataUrl;
};
const getPublicIdFromFileUrl = (fileUrl) => {
    const fileNameUsingSubString = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
    const publicId = fileNameUsingSubString.substring(0, fileNameUsingSubString.lastIndexOf('.'));
    return publicId;
};
exports.default = {
    uploadSingle(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileDataUrl = toDataURL(file);
            const result = yield cloudinary_1.v2.uploader.upload(fileDataUrl, {
                resource_type: 'auto',
            });
            return result;
        });
    },
    uploadMultiple(files) {
        return __awaiter(this, void 0, void 0, function* () {
            const uploadBatch = files.map((file) => {
                return this.uploadSingle(file);
            });
            const results = yield Promise.all(uploadBatch);
            return results;
        });
    },
    remove(fileUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const publicId = getPublicIdFromFileUrl(fileUrl);
            yield cloudinary_1.v2.uploader.destroy(publicId);
        });
    },
};
