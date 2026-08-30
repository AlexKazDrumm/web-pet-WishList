import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../lib/async-handler';
import { parseOrThrow } from '../../lib/validate';
import { requireAuth } from '../../middleware/auth';
import {
  createItemSchema,
  createListSchema,
  updateItemSchema,
  updateListSchema,
} from './lists.schemas';
import * as service from './lists.service';

const uuid = z.string().uuid();
const listParams = z.object({ id: uuid });
const itemParams = z.object({ id: uuid, itemId: uuid });

export const listsRouter = Router();

listsRouter.use(requireAuth);

listsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ lists: await service.getLists(req.user!.id) });
  }),
);

listsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(createListSchema, req.body);
    res.status(201).json({ list: await service.createList(req.user!.id, input) });
  }),
);

listsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(listParams, req.params);
    res.json(await service.getListWithItems(req.user!.id, id));
  }),
);

listsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(listParams, req.params);
    const input = parseOrThrow(updateListSchema, req.body);
    res.json({ list: await service.updateList(req.user!.id, id, input) });
  }),
);

listsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(listParams, req.params);
    await service.deleteList(req.user!.id, id);
    res.status(204).end();
  }),
);

listsRouter.get(
  '/:id/items',
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(listParams, req.params);
    res.json({ items: await service.getItems(req.user!.id, id) });
  }),
);

listsRouter.post(
  '/:id/items',
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(listParams, req.params);
    const input = parseOrThrow(createItemSchema, req.body);
    res.status(201).json({ item: await service.addItem(req.user!.id, id, input) });
  }),
);

listsRouter.patch(
  '/:id/items/:itemId',
  asyncHandler(async (req, res) => {
    const { id, itemId } = parseOrThrow(itemParams, req.params);
    const input = parseOrThrow(updateItemSchema, req.body);
    res.json({ item: await service.updateItem(req.user!.id, id, itemId, input) });
  }),
);

listsRouter.delete(
  '/:id/items/:itemId',
  asyncHandler(async (req, res) => {
    const { id, itemId } = parseOrThrow(itemParams, req.params);
    await service.deleteItem(req.user!.id, id, itemId);
    res.status(204).end();
  }),
);
