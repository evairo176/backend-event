import { MediaController } from './media.controller';
import { MediaService } from './media.service';

const mediaService = new MediaService();
const mediaController = new MediaController(mediaService);

export { mediaService, mediaController };
