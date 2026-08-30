import { API_BASE_URL } from './lib/config';

// Kept for backwards compatibility with existing imports. New code should use
// `src/lib/api` and `src/lib/config` directly.
const globals = {
  productionServerDomain: API_BASE_URL,
  productionSiteDomain: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};

export default globals;
