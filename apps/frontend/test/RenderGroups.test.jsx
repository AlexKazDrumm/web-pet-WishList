import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import RenderGroups from '../src/components/RenderGroups/RenderGroups';

const wishes = [
  {
    id: 1,
    title: 'Лисьи тропы',
    group_id: 10,
    cover_image: 'abc.jpg',
    min_players: 2,
    max_players: 4,
    prices: [{ cost: 5000, currency: 'tg' }],
    links: ['https://example.com/a'],
  },
  {
    id: 2,
    title: 'Башня ветров',
    group_id: 11,
    cover_image: null,
    min_players: 2,
    max_players: 2,
    prices: [],
    links: [],
  },
];

describe('RenderGroups', () => {
  it('renders every wish in the flat "all" view', () => {
    render(<RenderGroups groups={[]} wishes={wishes} selectedGroup="all" />);
    expect(screen.getByText('Лисьи тропы')).toBeInTheDocument();
    expect(screen.getByText('Башня ветров')).toBeInTheDocument();
    expect(screen.getByText('Все (2)')).toBeInTheDocument();
  });

  it('falls back to a placeholder when a wish has no cover', () => {
    render(<RenderGroups groups={[]} wishes={[wishes[1]]} selectedGroup="all" />);
    expect(screen.getByText('Нет обложки')).toBeInTheDocument();
  });

  it('groups wishes under their group titles', () => {
    const groups = [
      { id: 10, title: 'Семейные', description: 'desc' },
      { id: 11, title: 'Дуэли', description: null },
    ];
    render(<RenderGroups groups={groups} wishes={wishes} selectedGroup="all_by_groups" />);
    expect(screen.getByText('Семейные (1)')).toBeInTheDocument();
    expect(screen.getByText('Дуэли (1)')).toBeInTheDocument();
  });
});
