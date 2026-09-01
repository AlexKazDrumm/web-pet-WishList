export const currencyRates = Object.freeze({
  ru: 5.34,
  tg: 1,
  grn: 11.63,
  us: 477.55,
  uz: 0.038,
  sar: 126.43,
  byn: 147.72,
  eur: 539.57,
});

function titleOf(wish) {
  return String(wish?.title || '');
}

function numericPlayerCount(value) {
  const count = Number.parseInt(String(value), 10);
  return Number.isFinite(count) && count > 0 ? count : Number.POSITIVE_INFINITY;
}

function convertedPrices(prices) {
  if (!Array.isArray(prices)) return [];

  return prices.flatMap((price) => {
    const cost = Number(price?.cost);
    const currency = String(price?.currency || '').toLowerCase();
    const rate = currencyRates[currency];
    if (!Number.isFinite(cost) || cost <= 0 || !Number.isFinite(rate)) return [];
    return [{ costInTenge: cost * rate, isConverted: currency !== 'tg' }];
  });
}

function minimumPrice(wish) {
  const prices = convertedPrices(wish?.prices);
  return prices.length > 0
    ? Math.min(...prices.map((price) => price.costInTenge))
    : Number.POSITIVE_INFINITY;
}

export const sortFunctions = {
  title: (a, b) => titleOf(a).localeCompare(titleOf(b), 'ru'),
  min_price: (a, b) => minimumPrice(a) - minimumPrice(b) || titleOf(a).localeCompare(titleOf(b), 'ru'),
  min_players: (a, b) =>
    numericPlayerCount(a?.min_players) - numericPlayerCount(b?.min_players) ||
    titleOf(a).localeCompare(titleOf(b), 'ru'),
  max_players: (a, b) =>
    numericPlayerCount(a?.max_players) - numericPlayerCount(b?.max_players) ||
    titleOf(a).localeCompare(titleOf(b), 'ru'),
};

export function formatPlayers(minPlayers, maxPlayers) {
  if (minPlayers === '-' || maxPlayers === '-') return 'Дополнение к самостоятельной игре';
  if (minPlayers === '?' || maxPlayers === '?') return 'Количество игроков неизвестно';

  const min = numericPlayerCount(minPlayers);
  const max = numericPlayerCount(maxPlayers);
  const hasMin = Number.isFinite(min);
  const hasMax = Number.isFinite(max);

  if (!hasMin && !hasMax) return 'Количество игроков неизвестно';
  if (hasMin && !hasMax) return `Игроков: от ${min}`;
  if (!hasMin && hasMax) return `Игроков: до ${max}`;
  if (min === max) return `Игроков: ${min}`;
  return `Игроков: ${min}–${max}`;
}

function formatPrice(price) {
  return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function convertAndFormatPrices(prices) {
  const normalized = convertedPrices(prices);
  if (normalized.length === 0) return 'Неизвестно';

  const minPrice = Math.min(...normalized.map((price) => price.costInTenge));
  const maxPrice = Math.max(...normalized.map((price) => price.costInTenge));
  const isConverted = (value) =>
    normalized.some((price) => price.costInTenge === value && price.isConverted);

  if (minPrice === maxPrice) {
    return `${isConverted(minPrice) ? '~' : ''}${formatPrice(minPrice)} ₸`;
  }

  return `${isConverted(minPrice) ? '~' : ''}${formatPrice(minPrice)} – ${
    isConverted(maxPrice) ? '~' : ''
  }${formatPrice(maxPrice)} ₸`;
}

export const getFilteredAndSortedWishes = (
  wishesList,
  selectedGroup,
  sortKey,
  comparators = sortFunctions,
  searchQuery = '',
  showInCollectionOnly = false,
) => {
  let filteredWishes = [...wishesList];

  if (selectedGroup !== 'all' && selectedGroup !== 'all_by_groups') {
    filteredWishes = filteredWishes.filter((wish) => String(wish.group_id) === selectedGroup);
  }

  const normalizedSearch = searchQuery.trim().toLocaleLowerCase('ru');
  if (normalizedSearch) {
    filteredWishes = filteredWishes.filter((wish) =>
      titleOf(wish).toLocaleLowerCase('ru').includes(normalizedSearch),
    );
  }

  if (showInCollectionOnly) {
    filteredWishes = filteredWishes.filter((wish) => wish.in_collection);
  }

  return filteredWishes.sort(comparators[sortKey] || comparators.title);
};

export const groupWishesByGroupId = (wishes) =>
  wishes.reduce((groups, wish) => {
    const key = String(wish.group_id ?? 'ungrouped');
    groups[key] = groups[key] || [];
    groups[key].push(wish);
    return groups;
  }, {});

export const getGroupsWithWishes = (groups, wishesByGroup) =>
  groups.filter((group) => wishesByGroup[group.id]?.length > 0);

export const createGroupOptions = (groups, wishesByGroup) => {
  const groupsWithWishes = groups
    .filter((group) => wishesByGroup[group.id]?.length > 0)
    .sort((a, b) => a.title.localeCompare(b.title, 'ru'));

  return [
    { value: 'all', label: 'Все' },
    { value: 'all_by_groups', label: 'Все по группам' },
    ...groupsWithWishes.map((group) => ({ value: String(group.id), label: group.title })),
  ];
};

export const createSortOptions = () => [
  { value: 'title', label: 'По названию' },
  { value: 'min_price', label: 'По минимальной цене' },
  { value: 'min_players', label: 'По минимальному количеству игроков' },
  { value: 'max_players', label: 'По максимальному количеству игроков' },
];
