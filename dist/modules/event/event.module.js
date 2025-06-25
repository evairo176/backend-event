"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventController = exports.eventService = void 0;
const event_controller_1 = __importDefault(require("./event.controller"));
const event_service_1 = __importDefault(require("./event.service"));
const eventService = new event_service_1.default();
exports.eventService = eventService;
const eventController = new event_controller_1.default(eventService);
exports.eventController = eventController;
