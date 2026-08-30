'use strict';

// Shared runtime contract between the frontend and the backend.
// Types live alongside in index.d.ts.

/** List sections. Mirror of the legacy `group_sections` table. */
const SECTIONS = ['wishlist', 'boardgames', 'books', 'other'];

/** Media accepted by the upload pipeline: mime -> canonical extension. */
const ACCEPTED_UPLOAD_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

/** Stable machine-readable error codes returned as `{ error: { code, message } }`. */
const ERROR_CODES = {
  VALIDATION: 'validation_error',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  CONFLICT: 'conflict',
  RATE_LIMITED: 'rate_limited',
  PAYLOAD_TOO_LARGE: 'payload_too_large',
  UNSUPPORTED_MEDIA: 'unsupported_media_type',
  INTERNAL: 'internal_error',
};

/** API route paths, relative to `NEXT_PUBLIC_API_BASE_URL`. */
const ROUTES = {
  health: '/health',
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  lists: '/lists',
  list: (id) => `/lists/${id}`,
  listItems: (id) => `/lists/${id}/items`,
  listItem: (listId, itemId) => `/lists/${listId}/items/${itemId}`,
  uploads: '/uploads',
  file: (id) => `/files/${id}`,
  catalog: {
    sections: '/catalog/sections',
    wishTypes: '/catalog/wish-types',
    groups: '/catalog/groups',
    games: '/catalog/games',
  },
};

/** Build an absolute URL for a stored media file id. */
function fileUrl(baseUrl, id) {
  if (!id) return '';
  return `${String(baseUrl).replace(/\/+$/, '')}${ROUTES.file(id)}`;
}

module.exports = {
  SECTIONS,
  ACCEPTED_UPLOAD_TYPES,
  ERROR_CODES,
  ROUTES,
  fileUrl,
};
