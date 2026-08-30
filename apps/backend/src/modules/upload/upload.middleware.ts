import multer from 'multer';
import { getEnv } from '../../config/env';

const env = getEnv();

/**
 * In-memory multer with hard caps on size and file count. Nothing touches disk
 * until the byte signature is verified in the service — the client's declared
 * mime type and filename are never trusted to gate or name the file.
 */
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_UPLOAD_BYTES,
    files: 2,
    fields: 20,
    parts: 25,
  },
});

export const singleFile = upload.single('file');
export const gameMedia = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'instruction', maxCount: 1 },
]);
