import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService);

export { categoryService, categoryController };
