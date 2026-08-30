import { afterAll, beforeEach } from 'vitest';
import { pool } from '../../src/db/pool';

const MUTABLE_TABLES = [
  'refresh_tokens',
  'list_items',
  'lists',
  'users',
  'links',
  'board_games',
  'gift_groups',
  'wish_types',
  'group_sections',
];

beforeEach(async () => {
  await pool.query(`TRUNCATE ${MUTABLE_TABLES.join(', ')} RESTART IDENTITY CASCADE`);
});

afterAll(async () => {
  await pool.end();
});
