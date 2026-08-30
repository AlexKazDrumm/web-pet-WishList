import { randomUUID } from 'node:crypto';
import { ACCEPTED_UPLOAD_TYPES, type UploadResult } from '@wishlist/shared';
import { getEnv } from '../../config/env';
import { HttpError } from '../../lib/http-error';
import { persistBuffer } from './storage';
import { sniffMime } from './signature';

const env = getEnv();

/**
 * Validate an in-memory upload by its byte signature and store it under a
 * random, server-chosen name. The client's declared filename and mime are
 * never used to name or type the file.
 */
export async function storeUpload(file: Express.Multer.File): Promise<UploadResult> {
  if (!file || !file.buffer || file.buffer.length === 0) {
    throw HttpError.badRequest('Empty upload');
  }
  if (file.buffer.length > env.MAX_UPLOAD_BYTES) {
    throw HttpError.payloadTooLarge('File exceeds the size limit');
  }

  const mime = sniffMime(file.buffer);
  if (!mime) {
    throw HttpError.unsupportedMedia('File content is not a supported image or PDF');
  }

  const ext = ACCEPTED_UPLOAD_TYPES[mime];
  const id = `${randomUUID()}.${ext}`;
  await persistBuffer(file.buffer, id);

  return { id, mime, bytes: file.buffer.length };
}
