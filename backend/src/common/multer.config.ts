import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

// ファイル保存先ディレクトリの作成
const mediaDir = './media';
const videosDir = './media/videos';
const imagesDir = './media/images';
const thumbnailsDir = './media/thumbnails';

[mediaDir, videosDir, imagesDir, thumbnailsDir].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

export const multerConfig = {
  storage: diskStorage({
    destination: (_req, file, cb) => {
      const dir = file.mimetype.startsWith('video')
        ? videosDir
        : imagesDir;
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now();
      const ext = extname(file.originalname);
      const prefix = file.mimetype.startsWith('video') ? 'video' : 'image';
      cb(null, `${prefix}_${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    // 許可するMIMEタイプ
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('許可されていないファイル形式です'), false);
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
};
