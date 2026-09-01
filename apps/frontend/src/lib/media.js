import { fileUrl as sharedFileUrl } from '@wishlist/shared';
import { API_BASE_URL } from './config';

/** Absolute URL for a stored cover/instruction file id (or '' when missing). */
export function fileUrl(id) {
  if (!id) return '';
  return id.startsWith('/') ? id : sharedFileUrl(API_BASE_URL, id);
}
