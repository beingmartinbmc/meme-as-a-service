import express from 'express';
import request from 'supertest';
import { apiKeyAuth } from '../api/middleware/api-key';

function makeApp() {
  const app = express();
  app.use(express.json());
  app.get('/protected', apiKeyAuth, (_req, res) => res.json({ ok: true }));
  return app;
}

describe('apiKeyAuth', () => {
  const ORIGINAL = process.env.API_KEYS;

  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.API_KEYS;
    else process.env.API_KEYS = ORIGINAL;
  });

  it('passes through when API_KEYS is unset', async () => {
    delete process.env.API_KEYS;
    const res = await request(makeApp()).get('/protected');
    expect(res.status).toBe(200);
  });

  it('passes through when API_KEYS is empty', async () => {
    process.env.API_KEYS = '';
    const res = await request(makeApp()).get('/protected');
    expect(res.status).toBe(200);
  });

  it('rejects missing key when API_KEYS is set', async () => {
    process.env.API_KEYS = 'secret1,secret2';
    const res = await request(makeApp()).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('rejects wrong key', async () => {
    process.env.API_KEYS = 'secret1,secret2';
    const res = await request(makeApp()).get('/protected').set('x-api-key', 'wrong');
    expect(res.status).toBe(401);
  });

  it('accepts correct key', async () => {
    process.env.API_KEYS = 'secret1,secret2';
    const res = await request(makeApp()).get('/protected').set('x-api-key', 'secret2');
    expect(res.status).toBe(200);
  });

  it('trims whitespace from configured keys', async () => {
    process.env.API_KEYS = '  padded  ,  other  ';
    const res = await request(makeApp()).get('/protected').set('x-api-key', 'padded');
    expect(res.status).toBe(200);
  });
});
