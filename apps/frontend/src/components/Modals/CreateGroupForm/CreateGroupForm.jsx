import { useEffect, useRef, useState } from 'react';
import { ROUTES } from '@wishlist/shared';
import styles from './CreateGroupForm.module.css';
import { api, errorMessage } from '../../../lib/api';
import { useNotifications } from '../../../lib/notifications';

const CreateGroupForm = ({ section = 'boardgames', onClose, onCreated }) => {
  const { notify } = useNotifications();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    const firstInput = /** @type {HTMLInputElement | null} */ (
      dialogRef.current?.querySelector('input') ?? null
    );
    firstInput?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [onClose]);

  const submit = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('Введите название группы');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.post(ROUTES.catalog.groups, {
        title: title.trim(),
        description: description.trim() || undefined,
        section,
        wishTypeId: 3,
      });
      notify('Группа создана', 'accepted');
      await onCreated?.();
      onClose?.();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <>
      <div className={styles.modalBackground} aria-hidden="true" onClick={onClose} />
      <div ref={dialogRef} className={styles.container} role="dialog" aria-modal="true" aria-label="Новая группа">
        <div className={styles.closeBtnRow}>
          <button type="button" className={styles.closeBtn} aria-label="Закрыть" onClick={onClose}>
            ×
          </button>
        </div>
        <form className={styles.modalContent} onSubmit={submit}>
          <input
            value={title}
            required
            maxLength={200}
            aria-label="Название группы"
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название группы"
          />
          <input
            value={description}
            maxLength={2000}
            aria-label="Описание группы"
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание группы"
          />
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" disabled={busy}>
            {busy ? 'Создаём…' : 'Создать'}
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateGroupForm;
