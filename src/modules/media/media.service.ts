import uploader from '../../cummon/utils/uploader';

export class MediaService {
  public async single(file: Express.Multer.File) {
    const result = await uploader.uploadSingle(file);

    return result;
  }

  public async multiple(files: Express.Multer.File[]) {
    const result = await uploader.uploadMultiple(files);

    return result;
  }

  public async remove(fileUrl: string) {
    const result = await uploader.remove(fileUrl);

    return result;
  }
}
