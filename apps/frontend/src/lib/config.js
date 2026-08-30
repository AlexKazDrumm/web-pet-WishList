// Single source of truth for the backend origin. Set NEXT_PUBLIC_API_BASE_URL
// at build/run time; the fallback only helps local `next dev`.
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3031').replace(/\/+$/, '');
