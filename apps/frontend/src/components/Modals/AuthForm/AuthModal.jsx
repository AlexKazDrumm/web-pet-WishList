import { useState } from 'react';
import styles from './AuthModal.module.css';
import { useSession } from '../../../lib/session';
import { useNotifications } from '../../../lib/notifications';
import { errorMessage } from '../../../lib/api';

const AuthModal = ({ open, onClose, onDone }) => {
  const { login, register } = useSession();
  const { notify } = useNotifications();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const reset = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setBusy(false);
  };

  const close = () => {
    reset();
    onClose?.();
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        notify('Вы вошли в аккаунт', 'accepted');
      } else {
        await register(email.trim(), password, displayName.trim() || undefined);
        notify('Аккаунт создан', 'accepted');
      }
      reset();
      onClose?.();
      onDone?.();
    } catch (err) {
      setError(errorMessage(err, 'Не удалось выполнить вход'));
      setBusy(false);
    }
  };

  return (
    <>
      <div className={styles.modalBackground} onClick={close} />
      <div className={styles.container} role="dialog" aria-modal="true" aria-label="Вход в аккаунт">
        <div className={styles.closeBtnRow}>
          <span className={styles.closeBtn} onClick={close}>
            X
          </span>
        </div>
        <div className={styles.tabs}>
          <button
            type="button"
            className={mode === 'login' ? styles.tabActive : styles.tab}
            onClick={() => setMode('login')}
          >
            Вход
          </button>
          <button
            type="button"
            className={mode === 'register' ? styles.tabActive : styles.tab}
            onClick={() => setMode('register')}
          >
            Регистрация
          </button>
        </div>
        <form onSubmit={submit} className={styles.modalContent}>
          <input
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder={mode === 'login' ? 'Пароль' : 'Пароль (минимум 10 символов)'}
            value={password}
            required
            minLength={mode === 'register' ? 10 : undefined}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Имя (необязательно)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          )}
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" disabled={busy}>
            {busy ? 'Подождите…' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>
      </div>
    </>
  );
};

export default AuthModal;
