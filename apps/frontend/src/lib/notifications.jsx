import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const NotificationsContext = createContext(null);

let nextId = 0;

export function NotificationsProvider({ children }) {
  const [items, setItems] = useState([]);

  const dismiss = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (text, type = 'accepted', ttl = 6000) => {
      const id = ++nextId;
      setItems((current) => [...current, { id, text, type }]);
      if (ttl > 0) setTimeout(() => dismiss(id), ttl);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ items, notify, dismiss }), [items, notify, dismiss]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within <NotificationsProvider>');
  return ctx;
}
