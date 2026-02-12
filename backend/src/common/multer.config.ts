import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const videosDir = '/media/videos';
const imagesDir = '/media/images';
const thumbnailsDir = '/media/thumbnails';

[videosDir, imagesDir, thumbnailsDir].forEach((dir) => {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
});

export const multerConfig = {
  storage: diskStorage({
    destination: (_req, file, cb) => {
      cb(null, file.mimetype.startsWith('video') ? videosDir : imagesDir);
    },
    filename: (_req, file, cb) => {
      const prefix = file.mimetype.startsWith('video') ? 'video' : 'image';
      cb(null, `${prefix}_${Date.now()}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowedMimes = [
      'image/jpeg','image/png','image/gif','image/webp',
      'video/mp4','video/webm','video/quicktime',
    ];
    cb(allowedMimes.includes(file.mimetype)
      ? null : new Error('許可されていないファイル形式です'),
      allowedMimes.includes(file.mimetype));
  },
  limits: { fileSize: 500 * 1024 * 1024 },
};