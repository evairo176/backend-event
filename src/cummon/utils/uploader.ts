import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config/app.config';

// Configuration
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD.NAME,
  api_key: config.CLOUDINARY_CLOUD.API_KEY,
  api_secret: config.CLOUDINARY_CLOUD.API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const toDataURL = (file: Express.Multer.File) => {
  const base64 = Buffer.from(file.buffer).toString('base64');

  const dataUrl = `data:${file.mimetype};base64,${base64}`;

  return dataUrl;
};

const getPublicIdFromFileUrl = (fileUrl: string) => {
  const fileNameUsingSubString = fileUrl.substring(
    fileUrl.lastIndexOf('/') + 1,
  );

  const publicId = fileNameUsingSubString.substring(
    0,
    fileNameUsingSubString.lastIndexOf('.'),
  );

  return publicId;
};

export default {
  async uploadSingle(file: Express.Multer.File) {
    const fileDataUrl = toDataURL(file);
    const result = await cloudinary.uploader.upload(fileDataUrl, {
      resource_type: 'auto',
    });

    return result;
  },
  async uploadMultiple(files: Express.Multer.File[]) {
    const uploadBatch = files.map((file) => {
      return this.uploadSingle(file);
    });

    const results = await Promise.all(uploadBatch);

    return results;
  },
  async remove(fileUrl: string) {
    const publicId = getPublicIdFromFileUrl(fileUrl);
    const result = await cloudinary.uploader.destroy(publicId);
  },
};
