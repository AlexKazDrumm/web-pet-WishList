import { useEffect, useRef, useState } from 'react';
import styles from './Header.module.css';
import { useSession } from '../../lib/session';
import { useNotifications } from '../../lib/notifications';

const Header = ({ onRequestAuth }) => {
  const { status, isAuthenticated, user, signOut } = useSession();
  const { notify } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setMenuOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    notify('Сессия завершена', 'accepted');
  };

  return (
    <header className={styles.component}>
      <img src="/images/numbers2.png" alt="WishList" />

      <div className={styles.userArea} ref={wrapperRef}>
        {status === 'loading' ? (
          <span className={styles.userHint}>…</span>
        ) : isAuthenticated ? (
          <div className={styles.imageWrapper}>
            <button
              type="button"
              className={styles.userButton}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {user?.displayName || user?.email}
            </button>
            {menuOpen && (
              <div className={styles.dropdownMenu} role="menu">
                <div className={styles.arrow} />
                <div className={styles.list}>
                  <span className={styles.userHint}>{user?.email}</span>
                  <button type="button" role="menuitem" className={styles.link} onClick={handleSignOut}>
                    Выйти
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button type="button" className={styles.userButton} onClick={onRequestAuth}>
            Войти
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
