import { z } from 'zod';

const section = z.enum(['wishlist', 'boardgames', 'books', 'other']);

export const groupsQuerySchema = z.object({
  section: section.optional(),
});

export const createGroupSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().default(''),
  wishTypeId: z.coerce.number().int().positive().optional(),
  section,
});

/** Multipart fields arrive as strings; coerce here. */
const boolish = z
  .union([z.boolean(), z.string()])
  .transform((v) => v === true || v === 'true' || v === '1' || v === 'on');

export const createGameSchema = z.object({
  title: z.string().trim().min(1).max(300),
  groupId: z.coerce.number().int().positive().optional(),
  minPlayers: z.coerce.number().int().min(0).max(999).optional().default(0),
  maxPlayers: z.coerce.number().int().min(0).max(999).optional().default(0),
  video: z.string().trim().url().max(2000).optional().or(z.literal('')).transform((v) => v || undefined),
  inCollection: boolish.optional().default(false),
  inWishList: boolish.optional().default(false),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type CreateGameInput = z.infer<typeof createGameSchema>;
