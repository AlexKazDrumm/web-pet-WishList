import { describe, expect, it } from 'vitest';
import { formatPlayers, convertAndFormatPrices } from '../src/utils/utils';

describe('formatPlayers', () => {
  it('handles a range', () => {
    expect(formatPlayers(2, 4)).toBe('Игроков: 2 - 4');
  });

  it('handles an exact count', () => {
    expect(formatPlayers(2, 2)).toBe('Игроков: 2');
  });

  it('handles the expansion marker', () => {
    expect(formatPlayers('-', '-')).toBe('Дополнение к самостоятельной игре');
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
});
