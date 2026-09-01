import { describe, expect, it } from 'vitest';
import {
  convertAndFormatPrices,
  formatPlayers,
  getFilteredAndSortedWishes,
  sortFunctions,
} from '../src/utils/utils';

describe('formatPlayers', () => {
  it('handles a range', () => {
    expect(formatPlayers(2, 4)).toBe('Игроков: 2–4');
  });

  it('handles an exact count', () => {
    expect(formatPlayers(2, 2)).toBe('Игроков: 2');
  });

  it('handles the expansion marker', () => {
    expect(formatPlayers('-', '-')).toBe('Дополнение к самостоятельной игре');
  });

  it('does not present zeroes or missing values as a player count', () => {
    expect(formatPlayers(0, 0)).toBe('Количество игроков неизвестно');
    expect(formatPlayers(null, null)).toBe('Количество игроков неизвестно');
  });
});

describe('convertAndFormatPrices', () => {
  it('returns a placeholder for no prices', () => {
    expect(convertAndFormatPrices([])).toBe('Неизвестно');
    expect(convertAndFormatPrices(undefined)).toBe('Неизвестно');
  });

  it('formats a single tenge price without conversion mark', () => {
    expect(convertAndFormatPrices([{ cost: 5000, currency: 'tg' }])).toBe('5 000.00 ₸');
  });

  it('marks converted currencies with ~', () => {
    const result = convertAndFormatPrices([{ cost: 10, currency: 'eur' }]);
    expect(result.startsWith('~')).toBe(true);
    expect(result.endsWith('₸')).toBe(true);
  });

  it('ignores zero and unsupported currency entries', () => {
    expect(convertAndFormatPrices([{ cost: 0, currency: '-' }])).toBe('Неизвестно');
    expect(convertAndFormatPrices([{ cost: 10, currency: 'unknown' }])).toBe('Неизвестно');
  });
});

describe('catalog sorting', () => {
  it('sorts by numeric converted price and leaves the input untouched', () => {
    const wishes = [
      { title: 'Без цены', prices: [] },
      { title: 'Дороже', prices: [{ cost: 20, currency: 'eur' }] },
      { title: 'Дешевле', prices: [{ cost: 5000, currency: 'tg' }] },
    ];

    const result = getFilteredAndSortedWishes(wishes, 'all', 'min_price', sortFunctions);

    expect(result.map((wish) => wish.title)).toEqual(['Дешевле', 'Дороже', 'Без цены']);
    expect(wishes.map((wish) => wish.title)).toEqual(['Без цены', 'Дороже', 'Дешевле']);
  });
});
