import { useEffect, useRef, useState } from 'react';
import { ROUTES } from '@wishlist/shared';
import styles from './CreateBoardGameForm.module.css';
import { api, errorMessage } from '../../../lib/api';
import { useNotifications } from '../../../lib/notifications';

const CreateBoardGameForm = ({ groups = [], onClose, onCreated }) => {
  const { notify } = useNotifications();
  const [form, setForm] = useState({
    title: '',
    groupId: '',
    minPlayers: '',
    maxPlayers: '',
    video: '',
    inCollection: false,
    inWishList: false,
  });
  const [coverImage, setCoverImage] = useState(null);
  const [instruction, setInstruction] = useState(null);
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

  const update = (patch) => setForm((current) => ({ ...current, ...patch }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('Введите название игры');
      return;
    }
    setBusy(true);
    setError('');

    const payload = new FormData();
    payload.append('title', form.title.trim());
    if (form.groupId) payload.append('groupId', form.groupId);
    if (form.minPlayers) payload.append('minPlayers', form.minPlayers);
    if (form.maxPlayers) payload.append('maxPlayers', form.maxPlayers);
    if (form.video.trim()) payload.append('video', form.video.trim());
    payload.append('inCollection', String(form.inCollection));
    payload.append('inWishList', String(form.inWishList));
    if (coverImage) payload.append('coverImage', coverImage);
    if (instruction) payload.append('instruction', instruction);

    try {
      await api.post(ROUTES.catalog.games, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      notify('Игра добавлена', 'accepted');
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
      <div ref={dialogRef} className={styles.container} role="dialog" aria-modal="true" aria-label="Новая игра">
        <div className={styles.closeBtnRow}>
          <button type="button" className={styles.closeBtn} aria-label="Закрыть" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={submit} className={styles.modalContent}>
          <input
            type="text"
            required
            maxLength={300}
            aria-label="Название игры"
            value={form.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Название"
          />
          <label>
            <input
              type="checkbox"
              checked={form.inCollection}
              onChange={(e) => update({ inCollection: e.target.checked })}
            />{' '}
            В коллекции
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.inWishList}
              onChange={(e) => update({ inWishList: e.target.checked })}
            />{' '}
            В вишлисте
          </label>
          <select aria-label="Группа" value={form.groupId} onChange={(e) => update({ groupId: e.target.value })}>
            <option value="">Выберите группу</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.title}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            max="999"
            aria-label="Минимум игроков"
            value={form.minPlayers}
            onChange={(e) => update({ minPlayers: e.target.value })}
            placeholder="Игроков от"
          />
          <input
            type="number"
            min="0"
            max="999"
            aria-label="Максимум игроков"
            value={form.maxPlayers}
            onChange={(e) => update({ maxPlayers: e.target.value })}
            placeholder="Игроков до"
          />
          <input
            type="url"
            maxLength={2000}
            aria-label="Ссылка на видео"
            value={form.video}
            onChange={(e) => update({ video: e.target.value })}
            placeholder="Ссылка на видео"
          />
          <label className={styles.fileLabel}>
            Обложка
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
            />
          </label>
          <label className={styles.fileLabel}>
            Правила (PDF)
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setInstruction(e.target.files?.[0] || null)}
            />
          </label>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" disabled={busy}>
            {busy ? 'Сохраняем…' : 'Добавить'}
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateBoardGameForm;
