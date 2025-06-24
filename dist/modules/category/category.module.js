"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = exports.categoryService = void 0;
const category_controller_1 = require("./category.controller");
const category_service_1 = require("./category.service");
const categoryService = new category_service_1.CategoryService();
exports.categoryService = categoryService;
const categoryController = new category_controller_1.CategoryController(categoryService);
exports.categoryController = categoryController;
