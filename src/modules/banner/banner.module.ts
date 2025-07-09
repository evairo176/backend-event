import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';

const bannerService = new BannerService();
const bannerController = new BannerController(bannerService);

export { bannerService, bannerController };
