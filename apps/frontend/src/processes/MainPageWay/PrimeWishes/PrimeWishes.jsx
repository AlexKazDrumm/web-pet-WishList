import { useCallback, useEffect, useState } from 'react';
import { ROUTES } from '@wishlist/shared';
import styles from './PrimeWishes.module.css';
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

const PrimeWishes = () => {
  const { selectedGroup, sortKey, handleGroupChange, handleSortChange } = useSelectionHandlers('all', 'title');
  const [groups, setGroups] = useState([]);
  const [games, setGames] = useState([]);
  const [state, setState] = useState('loading'); // loading | error | ready
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    try {
      const [groupsRes, gamesRes] = await Promise.all([
        api.get(ROUTES.catalog.groups, { params: { section: 'wishlist' } }),
        api.get(ROUTES.catalog.games),
      ]);
      setGroups(groupsRes.data);
      setGames(gamesRes.data.filter((game) => game.in_wish_list === true));
      setState('ready');
    } catch (err) {
      setMessage(errorMessage(err));
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (state === 'loading') {
    return (
      <div className={styles.component}>
        <StatusBlock kind="loading" />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className={styles.component}>
        <StatusBlock kind="error" message={message} onAction={load} />
      </div>
    );
  }

  const wishesByGroup = groupWishesByGroupId(games);
  const groupsWithWishes = getGroupsWithWishes(groups, wishesByGroup);
  const wishes = getFilteredAndSortedWishes(games, selectedGroup, sortKey, sortFunctions);
  const groupOptions = createGroupOptions(groups, wishesByGroup);
  const sortOptions = createSortOptions();

  return (
    <div className={styles.component}>
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
      </div>
      {games.length === 0 ? (
        <StatusBlock
          kind="empty"
          title="Вишлист пуст"
          message="Здесь появятся игры, отмеченные как желаемые."
        />
      ) : (
        <RenderGroups groups={groupsWithWishes} wishes={wishes} selectedGroup={selectedGroup} />
      )}
    </div>
  );
};

export default PrimeWishes;
