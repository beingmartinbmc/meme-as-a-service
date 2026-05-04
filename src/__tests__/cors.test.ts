import express from 'express';
import request from 'supertest';
import { buildCorsOptions, corsMiddleware } from '../api/middleware/cors';

function makeApp() {
  const app = express();
  app.use(corsMiddleware());
  app.get('/x', (_req, res) => res.json({ ok: true }));
  // Wrap origin error into a 403 for testing.
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(403).json({ error: err.message });
  });
  return app;
}

describe('CORS middleware', () => {
  const ORIGINAL = process.env.CORS_ORIGINS;

  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.CORS_ORIGINS;
    else process.env.CORS_ORIGINS = ORIGINAL;
  });

  it('buildCorsOptions: wildcard when env unset', () => {
    delete process.env.CORS_ORIGINS;
    const opts = buildCorsOptions();
    expect(opts.origin).toBe(true);
  });

  it('buildCorsOptions: wildcard when env is "*"', () => {
    process.env.CORS_ORIGINS = '*';
    const opts = buildCorsOptions();
    expect(opts.origin).toBe(true);
  });

  it('buildCorsOptions: allowlist when env is set', () => {
    process.env.CORS_ORIGINS = 'http://a.com,http://b.com';
    const opts = buildCorsOptions();
    expect(typeof opts.origin).toBe('function');
  });

  it('allows requests with no Origin header', async () => {
    process.env.CORS_ORIGINS = 'http://a.com';
    const res = await request(makeApp()).get('/x');
    expect(res.status).toBe(200);
  });

  it('allows whitelisted origin', async () => {
    process.env.CORS_ORIGINS = 'http://a.com';
    const res = await request(makeApp()).get('/x').set('Origin', 'http://a.com');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://a.com');
  });

  it('blocks non-whitelisted origin', async () => {
    process.env.CORS_ORIGINS = 'http://a.com';
    const res = await request(makeApp()).get('/x').set('Origin', 'http://evil.com');
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/not allowed by CORS/);
  });
});
