import { describe, expect, it } from 'vitest';
import { api, bearer, registerUser } from './helpers/app';

// 1x1 transparent PNG.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

async function token() {
  const { tokens } = await registerUser(`up_${Date.now()}@example.com`);
  return tokens.accessToken;
}

describe('upload pipeline', () => {
  it('accepts a real PNG and serves it back', async () => {
    const t = await token();
    const res = await api().post('/uploads').set(bearer(t)).attach('file', PNG, 'anything.bin');
    expect(res.status).toBe(201);
    expect(res.body.mime).toBe('image/png');
    expect(res.body.id).toMatch(/^[0-9a-f-]{36}\.png$/);

    const file = await api().get(`/files/${res.body.id}`);
    expect(file.status).toBe(200);
    expect(file.headers['content-type']).toBe('image/png');
    expect(file.headers['x-content-type-options']).toBe('nosniff');
  });

  it('rejects a file whose bytes are not an accepted type even if the extension lies', async () => {
    const t = await token();
    const res = await api()
      .post('/uploads')
      .set(bearer(t))
      .attach('file', Buffer.from('just text, not an image'), { filename: 'evil.png', contentType: 'image/png' });
    expect(res.status).toBe(415);
    expect(res.body.error.code).toBe('unsupported_media_type');
  });

  it('rejects an oversized upload', async () => {
    const t = await token();
    const big = Buffer.alloc(8192, 0x20);
    const res = await api().post('/uploads').set(bearer(t)).attach('file', big, 'big.png');
    expect(res.status).toBe(413);
  });

  it('requires authentication', async () => {
    const res = await api().post('/uploads').attach('file', PNG, 'a.png');
    expect(res.status).toBe(401);
  });

  it('blocks path traversal and unknown ids on the file route', async () => {
    expect((await api().get('/files/..%2f..%2f..%2faccesses.js')).status).toBe(404);
    expect((await api().get('/files/etc/passwd')).status).toBe(404);
    expect((await api().get('/files/nope.txt')).status).toBe(404);
    expect((await api().get('/files/00000000-0000-0000-0000-000000000000.png')).status).toBe(404);
  });
});
