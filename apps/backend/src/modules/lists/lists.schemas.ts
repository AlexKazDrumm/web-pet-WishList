import { z } from 'zod';

const section = z.enum(['wishlist', 'boardgames', 'books', 'other']);

export const createListSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  section: section.default('other'),
});

export const updateListSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(2000).nullable(),
    section,
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: 'No fields to update' });

const currency = z.string().trim().min(1).max(8);

export const createItemSchema = z.object({
  title: z.string().trim().min(1).max(200),
  notes: z.string().trim().max(4000).optional(),
  coverImage: z.string().trim().max(200).optional(),
  link: z.string().trim().url().max(2000).optional(),
  priceAmount: z.number().nonnegative().max(1_000_000_000).optional(),
  priceCurrency: currency.optional(),
  isDone: z.boolean().optional(),
  position: z.number().int().min(0).max(100_000).optional(),
});

export const updateItemSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    notes: z.string().trim().max(4000).nullable(),
    coverImage: z.string().trim().max(200).nullable(),
    link: z.string().trim().url().max(2000).nullable(),
    priceAmount: z.number().nonnegative().max(1_000_000_000).nullable(),
    priceCurrency: currency.nullable(),
    isDone: z.boolean(),
    position: z.number().int().min(0).max(100_000),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: 'No fields to update' });

export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
