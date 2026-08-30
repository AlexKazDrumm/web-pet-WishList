import type {
  CatalogGame,
  CatalogGroup,
  CatalogSection,
  CatalogWishType,
} from '@wishlist/shared';
import { query } from '../../db/pool';

interface GameRow {
  id: number;
  title: string | null;
  group_id: number | null;
  cover_image: string | null;
  instruction: string | null;
  min_players: number | null;
  max_players: number | null;
  video: string | null;
  in_collection: boolean | null;
  in_wish_list: boolean | null;
}

interface LinkRow {
  wish_id: number;
  link: string | null;
  cost: string | null;
  currency: string | null;
}

export async function listSections(): Promise<CatalogSection[]> {
  const { rows } = await query<CatalogSection>('SELECT id, section FROM group_sections ORDER BY id ASC');
  return rows;
}

export async function listWishTypes(): Promise<CatalogWishType[]> {
  const { rows } = await query<CatalogWishType>(
    'SELECT id, name, description FROM wish_types ORDER BY name ASC',
  );
  return rows;
}

export async function listGroups(section?: string): Promise<CatalogGroup[]> {
  if (section) {
    const { rows } = await query<CatalogGroup>(
      `SELECT g.id, g.title, g.description, g.wish_type_id, g.group_section_id
       FROM gift_groups g
       JOIN group_sections s ON s.id = g.group_section_id
       WHERE s.section = $1
       ORDER BY g.title ASC`,
      [section],
    );
    return rows;
  }
  const { rows } = await query<CatalogGroup>(
    `SELECT id, title, description, wish_type_id, group_section_id
     FROM gift_groups ORDER BY title ASC`,
  );
  return rows;
}

export async function listGames(): Promise<CatalogGame[]> {
  const { rows: games } = await query<GameRow>('SELECT * FROM board_games ORDER BY title ASC');
  if (games.length === 0) return [];

  const ids = games.map((g) => g.id);
  const { rows: links } = await query<LinkRow>(
    `SELECT wish_id, link, cost, currency FROM links WHERE wish_type = 3 AND wish_id = ANY($1)`,
    [ids],
  );

  const byGame = new Map<number, LinkRow[]>();
  for (const link of links) {
    const bucket = byGame.get(link.wish_id) ?? [];
    bucket.push(link);
    byGame.set(link.wish_id, bucket);
  }

  return games.map((g) => {
    const related = byGame.get(g.id) ?? [];
    return {
      id: g.id,
      title: g.title,
      group_id: g.group_id,
      cover_image: g.cover_image,
      instruction: g.instruction,
      min_players: g.min_players,
      max_players: g.max_players,
      video: g.video,
      in_collection: Boolean(g.in_collection),
      in_wish_list: Boolean(g.in_wish_list),
      links: related.map((l) => l.link ?? '').filter(Boolean),
      prices: related
        .filter((l) => l.cost !== null && l.currency)
        .map((l) => ({ cost: Number(l.cost), currency: l.currency as string })),
    };
  });
}

export async function insertGroup(input: {
  title: string;
  description: string | null;
  wishTypeId: number | null;
  sectionId: number;
}): Promise<CatalogGroup> {
  const { rows } = await query<CatalogGroup>(
    `INSERT INTO gift_groups (title, description, wish_type_id, group_section_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, wish_type_id, group_section_id`,
    [input.title, input.description, input.wishTypeId, input.sectionId],
  );
  return rows[0]!;
}

export async function sectionIdByName(section: string): Promise<number | null> {
  const { rows } = await query<{ id: number }>('SELECT id FROM group_sections WHERE section = $1', [section]);
  return rows[0]?.id ?? null;
}

export async function insertGame(input: {
  title: string;
  groupId: number | null;
  minPlayers: number;
  maxPlayers: number;
  video: string | null;
  inCollection: boolean;
  inWishList: boolean;
  coverImage: string | null;
  instruction: string | null;
}): Promise<GameRow> {
  const { rows } = await query<GameRow>(
    `INSERT INTO board_games
       (title, group_id, min_players, max_players, video, in_collection, in_wish_list, cover_image, instruction)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      input.title,
      input.groupId,
      input.minPlayers,
      input.maxPlayers,
      input.video,
      input.inCollection,
      input.inWishList,
      input.coverImage,
      input.instruction,
    ],
  );
  return rows[0]!;
}
