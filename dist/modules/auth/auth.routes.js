"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_module_1 = require("./auth.module");
const authRoutes = (0, express_1.Router)();
authRoutes.post('/register', auth_module_1.authController.register);
authRoutes.post('/login', auth_module_1.authController.login);
exports.default = authRoutes;
