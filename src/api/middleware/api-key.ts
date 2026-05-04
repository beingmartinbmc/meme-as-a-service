import type { RequestHandler } from 'express';

function parseKeys(): Set<string> {
  const raw = process.env.API_KEYS || '';
  return new Set(
    raw
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0)
  );
}

/**
 * Enforces `x-api-key` when API_KEYS env var is set. Health/docs/openapi/metrics
 * endpoints are always public — mount this only on routes that need it.
 */
export const apiKeyAuth: RequestHandler = (req, res, next) => {
  const keys = parseKeys();
  if (keys.size === 0) return next();

  const supplied = req.header('x-api-key');
  if (!supplied || !keys.has(supplied)) {
    res.status(401).json({ error: 'Unauthorized', message: 'Valid x-api-key required' });
    return;
  }
  next();
};
