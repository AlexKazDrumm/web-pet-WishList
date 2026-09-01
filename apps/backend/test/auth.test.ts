import { describe, expect, it } from 'vitest';
import { api, bearer, registerUser } from './helpers/app';

describe('auth', () => {
  it('registers a new account and returns a session', async () => {
    const res = await api().post('/auth/register').send({ email: 'a@example.com', password: 'a-strong-password' });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('a@example.com');
    expect(res.body.tokens.accessToken).toBeTypeOf('string');
    expect(res.body.tokens.refreshToken).toBeTypeOf('string');
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  it('rejects a duplicate email with 409', async () => {
    await api().post('/auth/register').send({ email: 'dup@example.com', password: 'a-strong-password' });
    const res = await api().post('/auth/register').send({ email: 'dup@example.com', password: 'another-strong-1' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('conflict');
  });

  it('rejects a weak password with a validation error', async () => {
    const res = await api().post('/auth/register').send({ email: 'weak@example.com', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
  });

  it('logs in with correct credentials and rejects wrong ones', async () => {
    await api().post('/auth/register').send({ email: 'login@example.com', password: 'the-right-password' });

    const ok = await api().post('/auth/login').send({ email: 'login@example.com', password: 'the-right-password' });
    expect(ok.status).toBe(200);
    expect(ok.body.tokens.accessToken).toBeTypeOf('string');

    const bad = await api().post('/auth/login').send({ email: 'login@example.com', password: 'wrong' });
    expect(bad.status).toBe(401);
    expect(bad.body.error.code).toBe('unauthorized');
  });

  it('returns the profile for a valid token and 401 otherwise', async () => {
    const { tokens } = await registerUser('me@example.com');
    const ok = await api().get('/auth/me').set(bearer(tokens.accessToken));
    expect(ok.status).toBe(200);
    expect(ok.body.user.email).toBe('me@example.com');

    expect((await api().get('/auth/me')).status).toBe(401);
    expect((await api().get('/auth/me').set(bearer('garbage.token.value'))).status).toBe(401);
  });

  it('rotates the refresh token and invalidates the used one', async () => {
    const { tokens } = await registerUser('rotate@example.com');

    const first = await api().post('/auth/refresh').send({ refreshToken: tokens.refreshToken });
    expect(first.status).toBe(200);
    expect(first.body.tokens.refreshToken).not.toBe(tokens.refreshToken);

    const reuse = await api().post('/auth/refresh').send({ refreshToken: tokens.refreshToken });
    expect(reuse.status).toBe(401);

    const next = await api().post('/auth/refresh').send({ refreshToken: first.body.tokens.refreshToken });
    expect(next.status).toBe(200);
  });

  it('allows only one concurrent refresh for a single-use token', async () => {
    const { tokens } = await registerUser('concurrent-refresh@example.com');

    const responses = await Promise.all([
      api().post('/auth/refresh').send({ refreshToken: tokens.refreshToken }),
      api().post('/auth/refresh').send({ refreshToken: tokens.refreshToken }),
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([200, 401]);
  });

  it('logout revokes the refresh token', async () => {
    const { tokens } = await registerUser('logout@example.com');
    expect((await api().post('/auth/logout').send({ refreshToken: tokens.refreshToken })).status).toBe(204);
    expect((await api().post('/auth/refresh').send({ refreshToken: tokens.refreshToken })).status).toBe(401);
  });
});
