import { Request, Response } from 'express';
import { MediaService } from './media.service';
import { asyncHandler } from '../../middlewares';
import { BadRequestException } from '../../cummon/utils/catch-errors';
import { HTTPSTATUS } from '../../config/http.config';
import { removeFileSchema } from '../../cummon/validators/media.validator';

export class MediaController {
  private mediaService: MediaService;

  constructor(mediaService: MediaService) {
    this.mediaService = mediaService;
  }

  public single = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      if (!req.file) {
        throw new BadRequestException('File is not exist');
      }

      const result = await this.mediaService.single(req.file);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success upload a file',
        data: result,
      });
    },
  );

  public multiple = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      if (!req.files || req.files.length === 0) {
        throw new BadRequestException('Files is not exist');
      }

      const result = await this.mediaService.multiple(
        req.files as Express.Multer.File[],
      );

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success upload a files',
        data: result,
      });
    },
  );

  public remove = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { fileUrl } = removeFileSchema.parse({
        ...req?.body,
      });
      const result = await this.mediaService.remove(fileUrl);

      return res.status(HTTPSTATUS.OK).json({
        message: 'Success remove file',
        data: result,
      });
    },
  );
}
