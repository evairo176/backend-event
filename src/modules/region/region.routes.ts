import { Router } from 'express';
import { regionController } from './region.module';

const regionRoutes = Router();

regionRoutes.get(
  '/region/provinces',
  regionController.getAllProvinces,
  /**
   #swagger.tags = ["Region"]

   */
);
regionRoutes.get(
  '/region/province/:id',
  regionController.getProvince,
  /**
   #swagger.tags = ["Region"]

   */
);
regionRoutes.get(
  '/region/regency/:id',
  regionController.getRegency,
  /**
   #swagger.tags = ["Region"]

   */
);
regionRoutes.get(
  '/region/district/:id',
  regionController.getDistrict,
  /**
   #swagger.tags = ["Region"]

   */
);
regionRoutes.get(
  '/region/village/:id',
  regionController.getVillage,
  /**
   #swagger.tags = ["Region"]

   */
);
regionRoutes.get(
  '/region/search',
  regionController.findByCity,
  /**
   #swagger.tags = ["Region"]

   */
);

export default regionRoutes;
