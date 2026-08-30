import { useState } from 'react';
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
      <div className={styles.modalBackground} onClick={onClose} />
      <div className={styles.container} role="dialog" aria-modal="true" aria-label="Новая группа">
        <div className={styles.closeBtnRow}>
          <span className={styles.closeBtn} onClick={onClose}>
            X
          </span>
        </div>
        <form className={styles.modalContent} onSubmit={submit}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название группы" />
          <input
            value={description}
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
