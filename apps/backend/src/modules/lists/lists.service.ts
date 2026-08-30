import { HttpError } from '../../lib/http-error';
import * as repo from './lists.repo';
import type {
  CreateItemInput,
  CreateListInput,
  UpdateItemInput,
  UpdateListInput,
} from './lists.schemas';

export function getLists(userId: string) {
  return repo.listsForUser(userId);
}

export async function getListWithItems(userId: string, listId: string) {
  const list = await repo.findListForUser(listId, userId);
  if (!list) throw HttpError.notFound('List not found');
  const items = await repo.itemsForList(listId);
  return { list, items };
}

export function createList(userId: string, input: CreateListInput) {
  return repo.createList(userId, {
    title: input.title,
    description: input.description ?? null,
    section: input.section,
  });
}

export async function updateList(userId: string, listId: string, input: UpdateListInput) {
  const updated = await repo.updateList(listId, userId, input as Record<string, unknown>);
  if (!updated) throw HttpError.notFound('List not found');
  return updated;
}

export async function deleteList(userId: string, listId: string) {
  const removed = await repo.deleteList(listId, userId);
  if (!removed) throw HttpError.notFound('List not found');
}

async function assertOwnedList(userId: string, listId: string) {
  const list = await repo.findListForUser(listId, userId);
  if (!list) throw HttpError.notFound('List not found');
  return list;
}

export async function getItems(userId: string, listId: string) {
  await assertOwnedList(userId, listId);
  return repo.itemsForList(listId);
}

export async function addItem(userId: string, listId: string, input: CreateItemInput) {
  await assertOwnedList(userId, listId);
  return repo.createItem(listId, {
    title: input.title,
    notes: input.notes ?? null,
    coverImage: input.coverImage ?? null,
    link: input.link ?? null,
    priceAmount: input.priceAmount ?? null,
    priceCurrency: input.priceCurrency ?? null,
    isDone: input.isDone ?? false,
    position: input.position ?? 0,
  });
}

export async function updateItem(
  userId: string,
  listId: string,
  itemId: string,
  input: UpdateItemInput,
) {
  await assertOwnedList(userId, listId);
  const updated = await repo.updateItem(listId, itemId, input as Record<string, unknown>);
  if (!updated) throw HttpError.notFound('Item not found');
  return updated;
}

export async function deleteItem(userId: string, listId: string, itemId: string) {
  await assertOwnedList(userId, listId);
  const removed = await repo.deleteItem(listId, itemId);
  if (!removed) throw HttpError.notFound('Item not found');
}
