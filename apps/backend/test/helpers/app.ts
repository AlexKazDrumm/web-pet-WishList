import type { Express } from 'express';
import request from 'supertest';
import { createApp } from '../../src/app';

export const app: Express = createApp();
export const api = () => request(app);

export async function registerUser(
  email = `user_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`,
  password = 'correct horse battery',
) {
  const res = await api().post('/auth/register').send({ email, password });
  return { res, email, password, tokens: res.body.tokens as { accessToken: string; refreshToken: string } };
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
