import { Router } from 'express';
import { regionController } from './region.module';

const regionRoutes = Router();

regionRoutes.get('/region/provinces', regionController.getAllProvinces);
regionRoutes.get('/region/province/:id', regionController.getProvince);
regionRoutes.get('/region/regency/:id', regionController.getRegency);
regionRoutes.get('/region/district/:id', regionController.getDistrict);
regionRoutes.get('/region/village/:id', regionController.getVillage);
regionRoutes.get('/region/search', regionController.findByCity);

export default regionRoutes;
