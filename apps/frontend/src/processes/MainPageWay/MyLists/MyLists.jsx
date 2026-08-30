import { useCallback, useEffect, useState } from 'react';
import { ROUTES, SECTIONS } from '@wishlist/shared';
import styles from './MyLists.module.css';
import { api, errorMessage, uploadFile } from '../../../lib/api';
import { fileUrl } from '../../../lib/media';
import { useSession } from '../../../lib/session';
import { useNotifications } from '../../../lib/notifications';
import StatusBlock from '../../../components/UI/StatusBlock/StatusBlock';

const SECTION_LABELS = {
  wishlist: 'Вишлист',
  boardgames: 'Настолки',
  books: 'Книги',
  other: 'Прочее',
};

const emptyItem = { title: '', link: '', priceAmount: '', priceCurrency: '', file: null };

export default function MyLists({ onRequestAuth }) {
  const { isAuthenticated, status } = useSession();
  const { notify } = useNotifications();

  const [lists, setLists] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [items, setItems] = useState([]);
  const [listState, setListState] = useState('idle'); // idle | loading | error | ready
  const [itemsState, setItemsState] = useState('idle');
  const [newList, setNewList] = useState({ title: '', section: 'wishlist', description: '' });
  const [newItem, setNewItem] = useState(emptyItem);
  const [savingList, setSavingList] = useState(false);
  const [savingItem, setSavingItem] = useState(false);

  const loadLists = useCallback(async () => {
    setListState('loading');
    try {
      const { data } = await api.get(ROUTES.lists);
      setLists(data.lists);
      setListState('ready');
      setActiveId((current) => current ?? data.lists[0]?.id ?? null);
    } catch (err) {
      setListState('error');
      notify(errorMessage(err), 'error');
    }
  }, [notify]);

  const loadItems = useCallback(
    async (listId) => {
      if (!listId) {
        setItems([]);
        return;
      }
      setItemsState('loading');
      try {
        const { data } = await api.get(ROUTES.list(listId));
        setItems(data.items);
        setItemsState('ready');
      } catch (err) {
        setItemsState('error');
        notify(errorMessage(err), 'error');
      }
    },
    [notify],
  );

  useEffect(() => {
    if (isAuthenticated) loadLists();
  }, [isAuthenticated, loadLists]);

  useEffect(() => {
    if (isAuthenticated && activeId) loadItems(activeId);
  }, [isAuthenticated, activeId, loadItems]);

  if (status === 'loading') {
    return (
      <div className={styles.component}>
        <StatusBlock kind="loading" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.component}>
        <StatusBlock
          kind="empty"
          title="Нужен аккаунт"
          message="Войдите или зарегистрируйтесь, чтобы вести свои списки."
          actionLabel="Войти"
          onAction={onRequestAuth}
        />
      </div>
    );
  }

  const createList = async (event) => {
    event.preventDefault();
    if (!newList.title.trim()) return;
    setSavingList(true);
    try {
      const { data } = await api.post(ROUTES.lists, {
        title: newList.title.trim(),
        section: newList.section,
        description: newList.description.trim() || undefined,
      });
      setNewList({ title: '', section: newList.section, description: '' });
      setLists((current) => [data.list, ...current]);
      setActiveId(data.list.id);
      notify('Список создан', 'accepted');
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setSavingList(false);
    }
  };

  const removeList = async (listId) => {
    try {
      await api.delete(ROUTES.list(listId));
      setLists((current) => current.filter((l) => l.id !== listId));
      setActiveId((current) => (current === listId ? null : current));
      notify('Список удалён', 'accepted');
    } catch (err) {
      notify(errorMessage(err), 'error');
    }
  };

  const addItem = async (event) => {
    event.preventDefault();
    if (!newItem.title.trim() || !activeId) return;
    setSavingItem(true);
    try {
      let coverImage;
      if (newItem.file) {
        const uploaded = await uploadFile(newItem.file);
        coverImage = uploaded.id;
      }
      const payload = { title: newItem.title.trim() };
      if (newItem.link.trim()) payload.link = newItem.link.trim();
      if (newItem.priceAmount) payload.priceAmount = Number(newItem.priceAmount);
      if (newItem.priceCurrency.trim()) payload.priceCurrency = newItem.priceCurrency.trim();
      if (coverImage) payload.coverImage = coverImage;

      const { data } = await api.post(ROUTES.listItems(activeId), payload);
      setItems((current) => [...current, data.item]);
      setNewItem(emptyItem);
      setLists((current) =>
        current.map((l) => (l.id === activeId ? { ...l, itemCount: l.itemCount + 1 } : l)),
      );
      notify('Элемент добавлен', 'accepted');
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setSavingItem(false);
    }
  };

  const toggleDone = async (item) => {
    try {
      const { data } = await api.patch(ROUTES.listItem(activeId, item.id), { isDone: !item.isDone });
      setItems((current) => current.map((i) => (i.id === item.id ? data.item : i)));
    } catch (err) {
      notify(errorMessage(err), 'error');
    }
  };

  const renameItem = async (item, title) => {
    const next = title.trim();
    if (!next || next === item.title) return;
    try {
      const { data } = await api.patch(ROUTES.listItem(activeId, item.id), { title: next });
      setItems((current) => current.map((i) => (i.id === item.id ? data.item : i)));
      notify('Элемент обновлён', 'accepted');
    } catch (err) {
      notify(errorMessage(err), 'error');
    }
  };

  const removeItem = async (item) => {
    try {
      await api.delete(ROUTES.listItem(activeId, item.id));
      setItems((current) => current.filter((i) => i.id !== item.id));
      setLists((current) =>
        current.map((l) => (l.id === activeId ? { ...l, itemCount: Math.max(0, l.itemCount - 1) } : l)),
      );
      notify('Элемент удалён', 'accepted');
    } catch (err) {
      notify(errorMessage(err), 'error');
    }
  };

  const activeList = lists.find((l) => l.id === activeId) || null;

  return (
    <div className={styles.component}>
      <div className={styles.columns}>
        <aside className={styles.sidebar}>
          <form className={styles.newList} onSubmit={createList}>
            <input
              placeholder="Название списка"
              value={newList.title}
              onChange={(e) => setNewList({ ...newList, title: e.target.value })}
            />
            <select
              value={newList.section}
              onChange={(e) => setNewList({ ...newList, section: e.target.value })}
            >
              {SECTIONS.map((section) => (
                <option key={section} value={section}>
                  {SECTION_LABELS[section]}
                </option>
              ))}
            </select>
            <button type="submit" disabled={savingList}>
              {savingList ? 'Создаём…' : 'Новый список'}
            </button>
          </form>

          {listState === 'loading' && <StatusBlock kind="loading" />}
          {listState === 'error' && <StatusBlock kind="error" onAction={loadLists} />}
          {listState === 'ready' && lists.length === 0 && (
            <StatusBlock kind="empty" title="Пока нет списков" message="Создайте первый список слева." />
          )}
          <ul className={styles.listMenu}>
            {lists.map((list) => (
              <li key={list.id}>
                <button
                  type="button"
                  className={list.id === activeId ? styles.listItemActive : styles.listItem}
                  onClick={() => setActiveId(list.id)}
                >
                  <span className={styles.listTitle}>{list.title}</span>
                  <span className={styles.badge}>{list.itemCount}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className={styles.detail}>
          {!activeList ? (
            <StatusBlock kind="empty" title="Список не выбран" message="Выберите список слева или создайте новый." />
          ) : (
            <>
              <header className={styles.detailHead}>
                <div>
                  <h2>{activeList.title}</h2>
                  <span className={styles.sectionTag}>{SECTION_LABELS[activeList.section]}</span>
                </div>
                <button type="button" className={styles.dangerBtn} onClick={() => removeList(activeList.id)}>
                  Удалить список
                </button>
              </header>

              <form className={styles.newItem} onSubmit={addItem}>
                <input
                  placeholder="Что добавить?"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                />
                <input
                  placeholder="Ссылка (необязательно)"
                  value={newItem.link}
                  onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Цена"
                  value={newItem.priceAmount}
                  onChange={(e) => setNewItem({ ...newItem, priceAmount: e.target.value })}
                />
                <input
                  placeholder="Валюта"
                  maxLength={8}
                  value={newItem.priceCurrency}
                  onChange={(e) => setNewItem({ ...newItem, priceCurrency: e.target.value })}
                />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => setNewItem({ ...newItem, file: e.target.files?.[0] || null })}
                />
                <button type="submit" disabled={savingItem}>
                  {savingItem ? 'Сохраняем…' : 'Добавить'}
                </button>
              </form>

              {itemsState === 'loading' && <StatusBlock kind="loading" />}
              {itemsState === 'error' && <StatusBlock kind="error" onAction={() => loadItems(activeId)} />}
              {itemsState === 'ready' && items.length === 0 && (
                <StatusBlock kind="empty" title="Список пуст" message="Добавьте первый элемент через форму выше." />
              )}

              <ul className={styles.items}>
                {items.map((item) => (
                  <li key={item.id} className={item.isDone ? styles.itemDone : styles.itemRow}>
                    <input
                      type="checkbox"
                      checked={item.isDone}
                      onChange={() => toggleDone(item)}
                      aria-label="Отметить выполненным"
                    />
                    {item.coverImage && (
                      <img className={styles.itemCover} src={fileUrl(item.coverImage)} alt="" />
                    )}
                    <input
                      className={styles.itemTitle}
                      defaultValue={item.title}
                      onBlur={(e) => renameItem(item, e.target.value)}
                    />
                    {item.priceAmount != null && (
                      <span className={styles.itemPrice}>
                        {item.priceAmount} {item.priceCurrency}
                      </span>
                    )}
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.itemLink}>
                        ссылка
                      </a>
                    )}
                    <button type="button" className={styles.removeBtn} onClick={() => removeItem(item)}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
