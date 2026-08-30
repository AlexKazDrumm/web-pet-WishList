// Browser-only token storage shared by the axios client and the session store.
const ACCESS_KEY = 'wishlist.access';
const REFRESH_KEY = 'wishlist.refresh';

const canUseStorage = () => typeof window !== 'undefined' && !!window.localStorage;

export function getAccessToken() {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken() {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setTokens(tokens) {
  if (!canUseStorage() || !tokens) return;
  try {
    window.localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  } catch {
    /* storage disabled — session lives for this page only */
  }
}

export function clearTokens() {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* ignore */
  }
}
