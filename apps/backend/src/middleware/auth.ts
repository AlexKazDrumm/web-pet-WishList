import type { RequestHandler } from 'express';
import { HttpError } from '../lib/http-error';
import { verifyAccessToken } from '../modules/auth/tokens';

/** Require a valid Bearer access token; attaches `req.user`. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    next(HttpError.unauthorized('Missing Bearer token'));
    return;
  }
  try {
    const claims = verifyAccessToken(token);
    req.user = { id: claims.sub, email: claims.email };
    next();
  } catch (err) {
    next(err);
  }
};
