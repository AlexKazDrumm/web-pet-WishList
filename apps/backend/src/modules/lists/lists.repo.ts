import type { List, ListItem } from '@wishlist/shared';
import { query } from '../../db/pool';

interface ListRow {
  id: string;
  title: string;
  description: string | null;
  section: List['section'];
  item_count: string;
  created_at: Date;
  updated_at: Date;
}

interface ItemRow {
  id: string;
  list_id: string;
  title: string;
  notes: string | null;
  cover_image: string | null;
  link: string | null;
  price_amount: string | null;
  price_currency: string | null;
  is_done: boolean;
  position: number;
  created_at: Date;
  updated_at: Date;
}

const mapList = (row: ListRow): List => ({
  id: row.id,
  title: row.title,
  description: row.description,
  section: row.section,
  itemCount: Number(row.item_count),
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

const mapItem = (row: ItemRow): ListItem => ({
  id: row.id,
  listId: row.list_id,
  title: row.title,
  notes: row.notes,
  coverImage: row.cover_image,
  link: row.link,
  priceAmount: row.price_amount === null ? null : Number(row.price_amount),
  priceCurrency: row.price_currency,
  isDone: row.is_done,
  position: row.position,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

const LIST_SELECT = `
  SELECT l.id, l.title, l.description, l.section, l.created_at, l.updated_at,
         (SELECT count(*) FROM list_items i WHERE i.list_id = l.id) AS item_count
  FROM lists l`;

export async function listsForUser(userId: string): Promise<List[]> {
  const { rows } = await query<ListRow>(`${LIST_SELECT} WHERE l.user_id = $1 ORDER BY l.created_at DESC`, [userId]);
  return rows.map(mapList);
}

export async function findListForUser(id: string, userId: string): Promise<List | null> {
  const { rows } = await query<ListRow>(`${LIST_SELECT} WHERE l.id = $1 AND l.user_id = $2`, [id, userId]);
  return rows[0] ? mapList(rows[0]) : null;
}

export async function createList(
  userId: string,
  input: { title: string; description: string | null; section: List['section'] },
): Promise<List> {
  const { rows } = await query<{ id: string }>(
    `INSERT INTO lists (user_id, title, description, section) VALUES ($1, $2, $3, $4) RETURNING id`,
    [userId, input.title, input.description, input.section],
  );
  return (await findListForUser(rows[0]!.id, userId))!;
}

const LIST_COLUMNS: Record<string, string> = {
  title: 'title',
  description: 'description',
  section: 'section',
};

export async function updateList(
  id: string,
  userId: string,
  patch: Record<string, unknown>,
): Promise<List | null> {
  const set: string[] = [];
  const values: unknown[] = [];
  for (const [key, column] of Object.entries(LIST_COLUMNS)) {
    if (key in patch) {
      values.push(patch[key]);
      set.push(`${column} = $${values.length}`);
    }
  }
  if (set.length === 0) return findListForUser(id, userId);
  values.push(id, userId);
  const { rowCount } = await query(
    `UPDATE lists SET ${set.join(', ')} WHERE id = $${values.length - 1} AND user_id = $${values.length}`,
    values,
  );
  if (!rowCount) return null;
  return findListForUser(id, userId);
}

export async function deleteList(id: string, userId: string): Promise<boolean> {
  const { rowCount } = await query(`DELETE FROM lists WHERE id = $1 AND user_id = $2`, [id, userId]);
  return Boolean(rowCount);
}

/* ─── items ─────────────────────────────────────────────────────────────── */

const ITEM_SELECT = `SELECT * FROM list_items`;

export async function itemsForList(listId: string): Promise<ListItem[]> {
  const { rows } = await query<ItemRow>(
    `${ITEM_SELECT} WHERE list_id = $1 ORDER BY position ASC, created_at ASC`,
    [listId],
  );
  return rows.map(mapItem);
}

export async function findItem(listId: string, itemId: string): Promise<ListItem | null> {
  const { rows } = await query<ItemRow>(`${ITEM_SELECT} WHERE id = $1 AND list_id = $2`, [itemId, listId]);
  return rows[0] ? mapItem(rows[0]) : null;
}

export async function createItem(
  listId: string,
  input: {
    title: string;
    notes: string | null;
    coverImage: string | null;
    link: string | null;
    priceAmount: number | null;
    priceCurrency: string | null;
    isDone: boolean;
    position: number;
  },
): Promise<ListItem> {
  const { rows } = await query<ItemRow>(
    `INSERT INTO list_items
       (list_id, title, notes, cover_image, link, price_amount, price_currency, is_done, position)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      listId,
      input.title,
      input.notes,
      input.coverImage,
      input.link,
      input.priceAmount,
      input.priceCurrency,
      input.isDone,
      input.position,
    ],
  );
  return mapItem(rows[0]!);
}

const ITEM_COLUMNS: Record<string, string> = {
  title: 'title',
  notes: 'notes',
  coverImage: 'cover_image',
  link: 'link',
  priceAmount: 'price_amount',
  priceCurrency: 'price_currency',
  isDone: 'is_done',
  position: 'position',
};

export async function updateItem(
  listId: string,
  itemId: string,
  patch: Record<string, unknown>,
): Promise<ListItem | null> {
  const set: string[] = [];
  const values: unknown[] = [];
  for (const [key, column] of Object.entries(ITEM_COLUMNS)) {
    if (key in patch) {
      values.push(patch[key]);
      set.push(`${column} = $${values.length}`);
    }
  }
  if (set.length === 0) return findItem(listId, itemId);
  values.push(itemId, listId);
  const { rows } = await query<ItemRow>(
    `UPDATE list_items SET ${set.join(', ')}
     WHERE id = $${values.length - 1} AND list_id = $${values.length}
     RETURNING *`,
    values,
  );
  return rows[0] ? mapItem(rows[0]) : null;
}

export async function deleteItem(listId: string, itemId: string): Promise<boolean> {
  const { rowCount } = await query(`DELETE FROM list_items WHERE id = $1 AND list_id = $2`, [itemId, listId]);
  return Boolean(rowCount);
}
