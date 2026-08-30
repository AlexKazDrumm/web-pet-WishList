import { useCallback, useEffect, useState } from 'react';
import { ROUTES } from '@wishlist/shared';
import styles from './BoardGames.module.css';
import RenderGroups from '../../../components/RenderGroups/RenderGroups';
import StatusBlock from '../../../components/UI/StatusBlock/StatusBlock';
import {
  sortFunctions,
  groupWishesByGroupId,
  getGroupsWithWishes,
  getFilteredAndSortedWishes,
  createGroupOptions,
  createSortOptions,
} from '../../../utils/utils';
import { useSelectionHandlers } from '../../../hooks/useSelectionHandlers';
import { api, errorMessage } from '../../../lib/api';
import { useSession } from '../../../lib/session';
import CreateGroupForm from '../../../components/Modals/CreateGroupForm/CreateGroupForm';
import CreateBoardGameForm from '../../../components/Modals/CreateBoardGameForm/CreateBoardGameForm';

const BoardGames = ({ onRequestAuth }) => {
  const { isAuthenticated } = useSession();
  const { selectedGroup, sortKey, handleGroupChange, handleSortChange } = useSelectionHandlers('all', 'title');

  const [groups, setGroups] = useState([]);
  const [games, setGames] = useState([]);
  const [state, setState] = useState('loading');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInCollectionOnly, setShowInCollectionOnly] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showAddGameModal, setShowAddGameModal] = useState(false);

  const fetchGroups = useCallback(async () => {
    const { data } = await api.get(ROUTES.catalog.groups, { params: { section: 'boardgames' } });
    setGroups(data);
  }, []);

  const fetchGames = useCallback(async () => {
    const { data } = await api.get(ROUTES.catalog.games);
    setGames(data.filter((game) => game.in_wish_list === false));
  }, []);

  const load = useCallback(async () => {
    setState('loading');
    try {
      await Promise.all([fetchGroups(), fetchGames()]);
      setState('ready');
    } catch (err) {
      setMessage(errorMessage(err));
      setState('error');
    }
  }, [fetchGroups, fetchGames]);

  useEffect(() => {
    load();
  }, [load]);

  const guardedOpen = (setter) => () => {
    if (!isAuthenticated) {
      onRequestAuth?.();
      return;
    }
    setter(true);
  };

  const wishesByGroup = groupWishesByGroupId(games);
  const groupsWithWishes = getGroupsWithWishes(groups, wishesByGroup);
  const wishes = getFilteredAndSortedWishes(
    games,
    selectedGroup,
    sortKey,
    sortFunctions,
    searchQuery,
    showInCollectionOnly,
  );
  const groupOptions = createGroupOptions(groups, wishesByGroup);
  const sortOptions = createSortOptions();

  const filterBar = (
    <div className={styles.filters}>
      <select onChange={handleGroupChange} value={selectedGroup}>
        {groupOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select onChange={handleSortChange} value={sortKey}>
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Поиск по названию"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
      />
      {searchQuery && (
        <button type="button" className={styles.clearBtn} onClick={() => setSearchQuery('')}>
          Сбросить
        </button>
      )}
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={showInCollectionOnly}
          onChange={(event) => setShowInCollectionOnly(event.target.checked)}
        />
        Только в коллекции
      </label>
      <button type="button" onClick={guardedOpen(setShowAddGroupModal)}>
        Добавить группу
      </button>
      <button type="button" onClick={guardedOpen(setShowAddGameModal)}>
        Добавить игру
      </button>
    </div>
  );

  return (
    <div className={styles.component}>
      {showAddGroupModal && (
        <CreateGroupForm
          section="boardgames"
          onClose={() => setShowAddGroupModal(false)}
          onCreated={fetchGroups}
        />
      )}
      {showAddGameModal && (
        <CreateBoardGameForm
          groups={groups}
          onClose={() => setShowAddGameModal(false)}
          onCreated={fetchGames}
        />
      )}

      {filterBar}

      {state === 'loading' && <StatusBlock kind="loading" />}
      {state === 'error' && <StatusBlock kind="error" message={message} onAction={load} />}
      {state === 'ready' && games.length === 0 && (
        <StatusBlock kind="empty" title="Пока нет игр" message="Добавьте первую игру в коллекцию." />
      )}
      {state === 'ready' && games.length > 0 && wishes.length === 0 && (
        <StatusBlock kind="empty" title="Ничего не найдено" message="Измените фильтры или поисковый запрос." />
      )}
      {state === 'ready' && wishes.length > 0 && (
        <RenderGroups groups={groupsWithWishes} wishes={wishes} selectedGroup={selectedGroup} />
      )}
    </div>
  );
};

export default BoardGames;
