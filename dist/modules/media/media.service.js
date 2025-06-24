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
exports.MediaService = void 0;
const uploader_1 = __importDefault(require("../../cummon/utils/uploader"));
class MediaService {
    single(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield uploader_1.default.uploadSingle(file);
            return result;
        });
    }
    multiple(files) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield uploader_1.default.uploadMultiple(files);
            return result;
        });
    }
    remove(fileUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield uploader_1.default.remove(fileUrl);
            return result;
        });
    }
}
exports.MediaService = MediaService;
