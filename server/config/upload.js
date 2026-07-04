import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadPath = path.resolve(__dirname, '..', env.uploadDir);

const storage = multer.diskStorage({
  destination: uploadPath,
  filename: (_request, file, callback) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    callback(null, `${timestamp}-${safeName}`);
  }
});

export const upload = multer({ storage });
