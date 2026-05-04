import cors from 'cors';
import type { CorsOptions } from 'cors';

export function buildCorsOptions(): CorsOptions {
  const raw = process.env.CORS_ORIGINS;
  if (!raw || raw.trim() === '' || raw.trim() === '*') {
    return { origin: true };
  }
  const allow = new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  );
  return {
    origin: (origin, cb) => {
      if (!origin || allow.has(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error(`Origin '${origin}' not allowed by CORS`));
    },
    credentials: true
  };
}

export const corsMiddleware = () => cors(buildCorsOptions());
