import axios from 'axios';
import { ROUTES } from '@wishlist/shared';
import { API_BASE_URL } from './config';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokenStore';

export const SESSION_EXPIRED_EVENT = 'wishlist:session-expired';

function emitSessionExpired() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  }
}

/** Shared axios instance. All app requests go through here. */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshInFlight = null;

async function runRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('no refresh token');
  const { data } = await axios.post(`${API_BASE_URL}${ROUTES.auth.refresh}`, { refreshToken });
  setTokens(data.tokens);
  return data.tokens.accessToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    const url = config?.url ?? '';
    const isAuthCall = url.includes('/auth/');

    if (response?.status === 401 && config && !config.__retried && !isAuthCall && getRefreshToken()) {
      config.__retried = true;
      try {
        refreshInFlight = refreshInFlight ?? runRefresh();
        const accessToken = await refreshInFlight;
        refreshInFlight = null;
        if (config.headers) config.headers.Authorization = `Bearer ${accessToken}`;
        return api(config);
      } catch (refreshError) {
        refreshInFlight = null;
        clearTokens();
        emitSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    if (response?.status === 401 && !isAuthCall) {
      clearTokens();
      emitSessionExpired();
    }

    return Promise.reject(error);
  },
);

/** Pull a human-readable message out of an axios error. */
export function errorMessage(error, fallback = 'Что-то пошло не так. Попробуйте ещё раз.') {
  return error?.response?.data?.error?.message || error?.message || fallback;
}

/** Upload one file through the secured pipeline; resolves to `{ id, mime, bytes }`. */
export async function uploadFile(file) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post(ROUTES.uploads, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
