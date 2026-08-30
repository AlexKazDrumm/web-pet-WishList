export const sortFunctions = {
  title: (a, b) => a.title.localeCompare(b.title),
  min_price: (a, b) => {
    // Предполагаем, что convertAndFormatPrices уже определена в этом файле или импортирована
    const pricesA = convertAndFormatPrices(a.prices).split(' ')[0];
    const pricesB = convertAndFormatPrices(b.prices).split(' ')[0];
    return parseFloat(pricesA) - parseFloat(pricesB);
  },
  min_players: (a, b) => a.min_players - b.min_players,
  maxPlayers: (a, b) => a.max_players - b.max_players,
};

export function formatPlayers(min_players, max_players) {
  if (min_players === '-' || max_players === '-') {
    return "Дополнение к самостоятельной игре";
  } else if (min_players === '?' || max_players === '?') {
    return "Неизвестно";
  } else if (min_players && !max_players) {
    return `Игроков: от ${min_players}`;
  } else if (!min_players && max_players) {
    return `Игроков: до ${max_players}`;
  } else if (min_players === max_players) {
    return `Игроков: ${min_players}`;
  } else {
    return `Игроков: ${min_players} - ${max_players}`;
  }
}

export const currencyRates = {
  ru: 5.34,
  tg: 1,
  grn: 11.63,
  us: 477.55,
  uz: 0.038,
  sar: 126.43,
  byn: 147.72,
  eur: 539.57
};

export function convertAndFormatPrices(prices) {
  if (!prices || prices.length === 0) {
    return "Неизвестно";
  }

  // Функция для форматирования цены с пробелами
  const formatPrice = (price) => {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const pricesInTenge = prices.map(price => {
    const rate = currencyRates[price.currency] || 1;
    const costInTenge = price.cost * rate;
    return {
      costInTenge: costInTenge,
      isConverted: price.currency !== 'tg'
    };
  });

  const minPrice = Math.min(...pricesInTenge.map(price => price.costInTenge));
  const maxPrice = Math.max(...pricesInTenge.map(price => price.costInTenge));

  if (minPrice === maxPrice) {
    return `${pricesInTenge[0].isConverted ? '~' : ''}${formatPrice(minPrice)} ₸`;
  } else {
    const minSymbol = pricesInTenge.some(price => price.costInTenge === minPrice && price.isConverted) ? '~' : '';
    const maxSymbol = pricesInTenge.some(price => price.costInTenge === maxPrice && price.isConverted) ? '~' : '';
    return `${minSymbol}${formatPrice(minPrice)} - ${maxSymbol}${formatPrice(maxPrice)} ₸`;
  }
}

export const getFilteredAndSortedWishes = (wishesList, selectedGroup, sortKey, sortFunctions, searchQuery, showInCollectionOnly) => {
  let filteredWishes = wishesList;

  // Фильтрация по группе
  if (selectedGroup !== 'all' && selectedGroup !== 'all_by_groups') {
    filteredWishes = filteredWishes.filter(wish => wish.group_id.toString() === selectedGroup);
  }

  // Фильтрация по поисковому запросу
  if (searchQuery) {
    filteredWishes = filteredWishes.filter(wish => wish.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  // Фильтрация по in_collection
  if (showInCollectionOnly) {
    filteredWishes = filteredWishes.filter(wish => wish.in_collection);
  }

  return filteredWishes.sort(sortFunctions[sortKey]);
};

export const groupWishesByGroupId = (wishes) => {
  return wishes.reduce((acc, wish) => {
    (acc[wish.group_id] = acc[wish.group_id] || []).push(wish);
    return acc;
  }, {});
};

export const getGroupsWithWishes = (groups, wishesByGroup) => {
  return groups.filter(group => wishesByGroup[group.id] && wishesByGroup[group.id].length > 0);
};

export const createGroupOptions = (groups, wishesByGroup) => {
  // Фильтруем группы и сортируем их по алфавиту
  const groupsWithWishes = groups
    .filter(group => wishesByGroup[group.id] && wishesByGroup[group.id].length > 0)
    .sort((a, b) => a.title.localeCompare(b.title)); // Сортировка по алфавиту

  // Создаем опции для селекта
  return [
    { value: 'all', label: 'Все' },
    { value: 'all_by_groups', label: 'Все по группам' },
    ...groupsWithWishes.map(group => ({ value: group.id.toString(), label: group.title }))
  ];
};

export const createSortOptions = () => {
  return [
    { value: 'title', label: 'По названию' },
    { value: 'min_price', label: 'По минимальной цене' },
    { value: 'min_players', label: 'По минимальному количеству игроков' },
    { value: 'max_players', label: 'По максимальному количеству игроков' }
  ];
};
