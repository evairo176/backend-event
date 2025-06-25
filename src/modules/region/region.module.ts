import RegionController from './region.controller';
import RegionService from './region.service';

const regionService = new RegionService();
const regionController = new RegionController(regionService);

export { regionService, regionController };
