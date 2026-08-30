import { describe, expect, it } from 'vitest';
import { api } from './helpers/app';

describe('http hardening', () => {
  it('sets security headers and hides the framework', async () => {
    const res = await api().get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers).toHaveProperty('content-security-policy');
    expect(res.headers).not.toHaveProperty('x-powered-by');
  });

  it('returns a normalised 404 for unknown routes', async () => {
    const res = await api().get('/no/such/route');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: 'not_found', message: 'Route not found' } });
  });

  it('rejects a disallowed CORS origin', async () => {
    const res = await api().get('/health').set('Origin', 'https://evil.example');
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('forbidden');
  });

  it('allows a configured CORS origin', async () => {
    const res = await api().get('/health').set('Origin', 'http://localhost:3000');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('rejects an oversized JSON body', async () => {
    const res = await api()
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ email: 'a@b.co', password: 'x'.repeat(300_000) }));
    expect(res.status).toBe(413);
  });
});
