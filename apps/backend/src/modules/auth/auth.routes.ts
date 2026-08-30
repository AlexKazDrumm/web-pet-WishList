import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler';
import { parseOrThrow } from '../../lib/validate';
import { requireAuth } from '../../middleware/auth';
import { authRateLimit } from '../../middleware/security';
import { loginSchema, refreshSchema, registerSchema } from './auth.schemas';
import * as service from './auth.service';

export const authRouter = Router();

authRouter.post(
  '/register',
  authRateLimit,
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(registerSchema, req.body);
    const result = await service.register(input);
    res.status(201).json(result);
  }),
);

authRouter.post(
  '/login',
  authRateLimit,
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(loginSchema, req.body);
    const result = await service.login(input);
    res.json(result);
  }),
);

authRouter.post(
  '/refresh',
  authRateLimit,
  asyncHandler(async (req, res) => {
    const { refreshToken } = parseOrThrow(refreshSchema, req.body);
    const result = await service.refresh(refreshToken);
    res.json(result);
  }),
);

authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const refreshToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : undefined;
    await service.logout(refreshToken);
    res.status(204).end();
  }),
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const profile = await service.getProfile(req.user!.id);
    res.json({ user: profile });
  }),
);
