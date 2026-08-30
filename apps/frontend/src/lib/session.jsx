import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ROUTES } from '@wishlist/shared';
import { api, SESSION_EXPIRED_EVENT } from './api';
import { clearTokens, getAccessToken, setTokens } from './tokenStore';

/**
 * @typedef {{ id: string, email: string, displayName: string | null }} SessionUser
 */

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [user, setUser] = useState(/** @type {SessionUser | null} */ (null));
  const [status, setStatus] = useState('loading'); // loading | authenticated | anonymous

  const applySession = useCallback((data) => {
    setTokens(data.tokens);
    setUser(data.user);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.post(ROUTES.auth.logout, {
        refreshToken: typeof window !== 'undefined' ? window.localStorage.getItem('wishlist.refresh') : null,
      });
    } catch {
      /* best effort */
    }
    clearTokens();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post(ROUTES.auth.login, { email, password });
      applySession(data);
      return data.user;
    },
    [applySession],
  );

  const register = useCallback(
    async (email, password, displayName) => {
      const payload = displayName ? { email, password, displayName } : { email, password };
      const { data } = await api.post(ROUTES.auth.register, payload);
      applySession(data);
      return data.user;
    },
    [applySession],
  );

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (!getAccessToken()) {
        setStatus('anonymous');
        return;
      }
      try {
        const { data } = await api.get(ROUTES.auth.me);
        if (!cancelled) {
          setUser(data.user);
          setStatus('authenticated');
        }
      } catch {
        if (!cancelled) {
          clearTokens();
          setUser(null);
          setStatus('anonymous');
        }
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onExpired() {
      setUser(null);
      setStatus('anonymous');
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const value = useMemo(
    () => ({ user, status, isAuthenticated: status === 'authenticated', login, register, signOut }),
    [user, status, login, register, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within <SessionProvider>');
  return ctx;
}
