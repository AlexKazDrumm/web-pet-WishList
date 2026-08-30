import { beforeEach, describe, expect, it } from 'vitest';
import { pool } from '../src/db/pool';
import { api, bearer, registerUser } from './helpers/app';

async function seedCatalog() {
  await pool.query(`INSERT INTO group_sections (id, section) VALUES (1,'wishlist'),(2,'boardgames') ON CONFLICT DO NOTHING`);
  await pool.query(`INSERT INTO wish_types (id, name, description) VALUES (3,'board_game','Настольные игры') ON CONFLICT DO NOTHING`);
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO gift_groups (title, description, wish_type_id, group_section_id)
     VALUES ('Family','fun',3,2) RETURNING id`,
  );
  const groupId = rows[0].id;
  const game = await pool.query<{ id: number }>(
    `INSERT INTO board_games (title, group_id, min_players, max_players, in_wish_list, cover_image)
     VALUES ('Test Game',$1,2,4,false,'965720.jpg') RETURNING id`,
    [groupId],
  );
  await pool.query(
    `INSERT INTO links (link, currency, cost, wish_type, wish_id)
     VALUES ('https://example.com/a','tg',5000,3,$1),('https://example.com/b','eur',19,3,$1)`,
    [game.rows[0].id],
  );
}

describe('catalog', () => {
  beforeEach(seedCatalog);

  it('returns games with links and prices in the legacy shape', async () => {
    const res = await api().get('/catalog/games');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    const game = res.body[0];
    expect(game.title).toBe('Test Game');
    expect(game.links).toEqual(['https://example.com/a', 'https://example.com/b']);
    expect(game.prices).toEqual([
      { cost: 5000, currency: 'tg' },
      { cost: 19, currency: 'eur' },
    ]);
    expect(game.in_wish_list).toBe(false);
  });

  it('filters groups by section name', async () => {
    const res = await api().get('/catalog/groups').query({ section: 'boardgames' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Family');

    const empty = await api().get('/catalog/groups').query({ section: 'wishlist' });
    expect(empty.body).toHaveLength(0);
  });

  it('exposes sections and wish types', async () => {
    expect((await api().get('/catalog/sections')).body.length).toBeGreaterThanOrEqual(2);
    expect((await api().get('/catalog/wish-types')).body[0]).toHaveProperty('name');
  });

  it('requires auth to create a group', async () => {
    expect((await api().post('/catalog/groups').send({ title: 'x', section: 'boardgames' })).status).toBe(401);

    const { tokens } = await registerUser('catalog@example.com');
    const res = await api()
      .post('/catalog/groups')
      .set(bearer(tokens.accessToken))
      .send({ title: 'New group', section: 'boardgames', wishTypeId: 3 });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New group');
    expect(res.body.group_section_id).toBe(2);
  });
});
