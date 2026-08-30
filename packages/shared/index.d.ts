export type Section = 'wishlist' | 'boardgames' | 'books' | 'other';

export const SECTIONS: readonly Section[];

export const ACCEPTED_UPLOAD_TYPES: {
  readonly 'image/jpeg': 'jpg';
  readonly 'image/png': 'png';
  readonly 'image/webp': 'webp';
  readonly 'application/pdf': 'pdf';
};

export type ErrorCode =
  | 'validation_error'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'payload_too_large'
  | 'unsupported_media_type'
  | 'internal_error';

export const ERROR_CODES: {
  readonly VALIDATION: 'validation_error';
  readonly UNAUTHORIZED: 'unauthorized';
  readonly FORBIDDEN: 'forbidden';
  readonly NOT_FOUND: 'not_found';
  readonly CONFLICT: 'conflict';
  readonly RATE_LIMITED: 'rate_limited';
  readonly PAYLOAD_TOO_LARGE: 'payload_too_large';
  readonly UNSUPPORTED_MEDIA: 'unsupported_media_type';
  readonly INTERNAL: 'internal_error';
};

export interface ApiError {
  error: { code: ErrorCode; message: string; details?: unknown };
}

export const ROUTES: {
  health: string;
  auth: { register: string; login: string; refresh: string; logout: string; me: string };
  lists: string;
  list: (id: string) => string;
  listItems: (id: string) => string;
  listItem: (listId: string, itemId: string) => string;
  uploads: string;
  file: (id: string) => string;
  catalog: { sections: string; wishTypes: string; groups: string; games: string };
};

export function fileUrl(baseUrl: string, id: string): string;

/* ─── Domain models ─────────────────────────────────────────────────────── */

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface List {
  id: string;
  title: string;
  description: string | null;
  section: Section;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListItem {
  id: string;
  listId: string;
  title: string;
  notes: string | null;
  coverImage: string | null;
  link: string | null;
  priceAmount: number | null;
  priceCurrency: string | null;
  isDone: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResult {
  id: string;
  mime: string;
  bytes: number;
}

/* ─── Catalog (legacy showcase, read-compatible with the previous API) ──── */

export interface CatalogSection {
  id: number;
  section: string;
}

export interface CatalogWishType {
  id: number;
  name: string;
  description: string | null;
}

export interface CatalogGroup {
  id: number;
  title: string;
  description: string | null;
  wish_type_id: number | null;
  group_section_id: number | null;
}

export interface CatalogPrice {
  cost: number;
  currency: string;
}

export interface CatalogGame {
  id: number;
  title: string | null;
  group_id: number | null;
  cover_image: string | null;
  instruction: string | null;
  min_players: number | null;
  max_players: number | null;
  video: string | null;
  in_collection: boolean;
  in_wish_list: boolean;
  links: string[];
  prices: CatalogPrice[];
}
