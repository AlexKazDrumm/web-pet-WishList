import { describe, expect, it } from 'vitest';
import { api, bearer, registerUser } from './helpers/app';

async function auth(email: string) {
  const { tokens } = await registerUser(email);
  return bearer(tokens.accessToken);
}

describe('lists and items', () => {
  it('runs the full list lifecycle for the owner', async () => {
    const headers = await auth('lists-owner@example.com');

    const created = await api()
      .post('/lists')
      .set(headers)
      .send({ title: 'Birthday', description: 'ideas', section: 'wishlist' });
    expect(created.status).toBe(201);
    const listId = created.body.list.id;
    expect(created.body.list.itemCount).toBe(0);

    const all = await api().get('/lists').set(headers);
    expect(all.status).toBe(200);
    expect(all.body.lists).toHaveLength(1);

    const item = await api()
      .post(`/lists/${listId}/items`)
      .set(headers)
      .send({ title: 'Headphones', priceAmount: 199.99, priceCurrency: 'eur', link: 'https://example.com/x' });
    expect(item.status).toBe(201);
    const itemId = item.body.item.id;
    expect(item.body.item.priceAmount).toBe(199.99);

    const withItems = await api().get(`/lists/${listId}`).set(headers);
    expect(withItems.body.items).toHaveLength(1);
    expect(withItems.body.list.itemCount).toBe(1);

    const patched = await api()
      .patch(`/lists/${listId}/items/${itemId}`)
      .set(headers)
      .send({ isDone: true, notes: 'ordered' });
    expect(patched.status).toBe(200);
    expect(patched.body.item.isDone).toBe(true);

    const renamed = await api().patch(`/lists/${listId}`).set(headers).send({ title: 'Birthday 2026' });
    expect(renamed.body.list.title).toBe('Birthday 2026');

    expect((await api().delete(`/lists/${listId}/items/${itemId}`).set(headers)).status).toBe(204);
    expect((await api().delete(`/lists/${listId}`).set(headers)).status).toBe(204);
    expect((await api().get(`/lists/${listId}`).set(headers)).status).toBe(404);
  });

  it('does not leak another user\'s list', async () => {
    const owner = await auth('owner2@example.com');
    const intruder = await auth('intruder@example.com');

    const created = await api().post('/lists').set(owner).send({ title: 'Private', section: 'other' });
    const listId = created.body.list.id;

    expect((await api().get(`/lists/${listId}`).set(intruder)).status).toBe(404);
    expect((await api().patch(`/lists/${listId}`).set(intruder).send({ title: 'hijack' })).status).toBe(404);
    expect((await api().post(`/lists/${listId}/items`).set(intruder).send({ title: 'x' })).status).toBe(404);
    expect((await api().delete(`/lists/${listId}`).set(intruder)).status).toBe(404);
  });

  it('requires authentication', async () => {
    expect((await api().get('/lists')).status).toBe(401);
    expect((await api().post('/lists').send({ title: 'x' })).status).toBe(401);
  });

  it('validates payloads', async () => {
    const headers = await auth('validate@example.com');
    expect((await api().post('/lists').set(headers).send({ title: '' })).status).toBe(400);
    expect((await api().post('/lists').set(headers).send({ title: 'ok', section: 'nope' })).status).toBe(400);

    const list = await api().post('/lists').set(headers).send({ title: 'ok' });
    const bad = await api()
      .post(`/lists/${list.body.list.id}/items`)
      .set(headers)
      .send({ title: 'ok', link: 'not-a-url' });
    expect(bad.status).toBe(400);
  });

  it('rejects a non-uuid list id', async () => {
    const headers = await auth('uuid@example.com');
    expect((await api().get('/lists/123').set(headers)).status).toBe(400);
  });
});
