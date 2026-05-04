import express from 'express';
import request from 'supertest';
import { requestId } from '../api/middleware/request-id';

function makeApp() {
  const app = express();
  app.use(requestId);
  app.get('/x', (req, res) => {
    res.json({ id: (req as unknown as { id: string }).id });
  });
  return app;
}

describe('request-id middleware', () => {
  it('generates a uuid when header missing', async () => {
    const res = await request(makeApp()).get('/x');
    expect(res.body.id).toMatch(/[a-f0-9-]{8,}/);
    expect(res.headers['x-request-id']).toBe(res.body.id);
  });

  it('propagates incoming x-request-id', async () => {
    const res = await request(makeApp()).get('/x').set('x-request-id', 'abc-123');
    expect(res.body.id).toBe('abc-123');
    expect(res.headers['x-request-id']).toBe('abc-123');
  });

  it('ignores absurdly long incoming ids', async () => {
    const res = await request(makeApp()).get('/x').set('x-request-id', 'a'.repeat(500));
    expect(res.body.id).not.toBe('a'.repeat(500));
  });
});
