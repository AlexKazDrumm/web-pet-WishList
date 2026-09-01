import '../config/load-env';
import bcrypt from 'bcryptjs';
import { closePool, withTransaction } from './pool';
import { logger } from '../lib/logger';

const DEMO_EMAIL = 'demo@wishlist.local';
const DEMO_PASSWORD = 'demo-passphrase-123';

const SECTIONS = [
  { id: 1, section: 'wishlist' },
  { id: 2, section: 'boardgames' },
  { id: 3, section: 'books' },
  { id: 4, section: 'other' },
];

const WISH_TYPES = [
  { id: 1, name: 'other', description: 'Прочее' },
  { id: 2, name: 'book', description: 'Книги' },
  { id: 3, name: 'board_game', description: 'Настольные игры' },
];

const GROUPS = [
  { title: 'Семейные вечера', description: 'Лёгкие игры для компании любого возраста', wish_type_id: 3, section: 2 },
  { title: 'Дуэли на двоих', description: 'Быстрые партии один на один', wish_type_id: 3, section: 2 },
  { title: 'Подарки к празднику', description: 'Что хочется получить в подарок', wish_type_id: 1, section: 1 },
];

interface GameSeed {
  title: string;
  groupIndex: number;
  min: number;
  max: number;
  inCollection: boolean;
  inWishList: boolean;
  links: { link: string; cost: number; currency: string }[];
}

const GAMES: GameSeed[] = [
  {
    title: 'Лисьи тропы',
    groupIndex: 0,
    min: 2,
    max: 5,
    inCollection: true,
    inWishList: false,
    links: [{ link: 'https://example.com/games/fox-trails', cost: 6900, currency: 'tg' }],
  },
  {
    title: 'Башня ветров',
    groupIndex: 0,
    min: 2,
    max: 4,
    inCollection: false,
    inWishList: true,
    links: [
      { link: 'https://example.com/games/wind-tower', cost: 12900, currency: 'tg' },
      { link: 'https://example.com/eu/wind-tower', cost: 29, currency: 'eur' },
    ],
  },
  {
    title: 'Дуэль архивариусов',
    groupIndex: 1,
    min: 2,
    max: 2,
    inCollection: true,
    inWishList: false,
    links: [{ link: 'https://example.com/games/archivists-duel', cost: 8400, currency: 'tg' }],
  },
  {
    title: 'Ороли ночного города',
    groupIndex: 1,
    min: 2,
    max: 2,
    inCollection: false,
    inWishList: true,
    links: [],
  },
];

async function seed(): Promise<void> {
  await withTransaction(async (client) => {
    const { rows: existing } = await client.query<{ count: string }>('SELECT count(*)::text FROM board_games');
    if (Number(existing[0]?.count ?? '0') > 0) {
      logger.info('catalog already populated, skipping catalog seed');
    } else {
      for (const s of SECTIONS) {
        await client.query('INSERT INTO group_sections (id, section) VALUES ($1, $2) ON CONFLICT DO NOTHING', [
          s.id,
          s.section,
        ]);
      }
      for (const t of WISH_TYPES) {
        await client.query(
          'INSERT INTO wish_types (id, name, description) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [t.id, t.name, t.description],
        );
      }
      await client.query("SELECT setval(pg_get_serial_sequence('group_sections','id'), (SELECT max(id) FROM group_sections))");
      await client.query("SELECT setval(pg_get_serial_sequence('wish_types','id'), (SELECT max(id) FROM wish_types))");

      const groupIds: number[] = [];
      for (const g of GROUPS) {
        const { rows } = await client.query<{ id: number }>(
          `INSERT INTO gift_groups (title, description, wish_type_id, group_section_id)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [g.title, g.description, g.wish_type_id, g.section],
        );
        groupIds.push(rows[0]!.id);
      }

      for (const game of GAMES) {
        const { rows } = await client.query<{ id: number }>(
          `INSERT INTO board_games
             (title, group_id, min_players, max_players, in_collection, in_wish_list)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [game.title, groupIds[game.groupIndex], game.min, game.max, game.inCollection, game.inWishList],
        );
        const gameId = rows[0]!.id;
        for (const link of game.links) {
          await client.query(
            `INSERT INTO links (link, currency, cost, wish_type, wish_id) VALUES ($1, $2, $3, 3, $4)`,
            [link.link, link.currency, link.cost, gameId],
          );
        }
      }
      logger.info({ groups: GROUPS.length, games: GAMES.length }, 'catalog seed inserted');
    }

    // Create the demo account and starter lists only once. Re-running the seed
    // must never reset data created through the demo account.
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
    const { rows: insertedUsers } = await client.query<{ id: string }>(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [DEMO_EMAIL, passwordHash, 'Demo'],
    );
    const userId =
      insertedUsers[0]?.id ??
      (
        await client.query<{ id: string }>('SELECT id FROM users WHERE email = $1', [DEMO_EMAIL])
      ).rows[0]!.id;

    const { rows: listCountRows } = await client.query<{ count: string }>(
      'SELECT count(*)::text AS count FROM lists WHERE user_id = $1',
      [userId],
    );

    if (Number(listCountRows[0]?.count ?? '0') === 0) {
      const { rows: listRows } = await client.query<{ id: string }>(
        `INSERT INTO lists (user_id, title, description, section) VALUES
           ($1, 'День рождения', 'Идеи подарков на ближайший праздник', 'wishlist'),
           ($1, 'Настолки в коллекции', 'То, что уже стоит на полке', 'boardgames')
         RETURNING id`,
        [userId],
      );

      await client.query(
        `INSERT INTO list_items (list_id, title, notes, link, price_amount, price_currency, position) VALUES
           ($1, 'Наушники с шумоподавлением', 'Любой удобный форм-фактор', 'https://example.com/headphones', 89900, 'tg', 0),
           ($1, 'Книга по типографике', NULL, 'https://example.com/book', 12000, 'tg', 1),
           ($2, 'Лисьи тропы', 'Уже открыта, играем часто', NULL, NULL, NULL, 0),
           ($2, 'Дуэль архивариусов', NULL, NULL, NULL, NULL, 1)`,
        [listRows[0]!.id, listRows[1]!.id],
      );
    }

    logger.info({ email: DEMO_EMAIL }, 'demo account ready');
  });
}

seed()
  .then(() => closePool())
  .then(() => {
    logger.info('seed complete');
    process.exit(0);
  })
  .catch(async (err) => {
    logger.error({ err }, 'seed failed');
    await closePool().catch(() => undefined);
    process.exit(1);
  });
