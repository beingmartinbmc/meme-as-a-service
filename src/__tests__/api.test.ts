import request from 'supertest';
import app from '../api/server';

describe('API server', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBeDefined();
  });

  it('GET /openapi.json returns the OpenAPI document', async () => {
    const res = await request(app).get('/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(res.body.paths['/meme/{template}']).toBeDefined();
  });

  it('GET /docs returns swagger HTML', async () => {
    const res = await request(app).get('/docs');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('swagger-ui');
  });

  it('GET /templates lists built-ins', async () => {
    const res = await request(app).get('/templates');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.templates)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
    const ids = res.body.templates.map((t: { id: string }) => t.id);
    expect(ids).toContain('drake');
  });

  it('GET /templates/:name returns 404 for unknown', async () => {
    const res = await request(app).get('/templates/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('GET /meme/:template renders an image', async () => {
    const res = await request(app)
      .get('/meme/drake')
      .query({ top: 'Hello', bottom: 'World' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/png');
    expect(res.body).toBeInstanceOf(Buffer);
  });

  it('GET /meme/:template rejects bad strokeWidth', async () => {
    const res = await request(app).get('/meme/drake').query({ strokeWidth: '9999' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('POST /meme/batch validates payload shape', async () => {
    const res = await request(app)
      .post('/meme/batch')
      .send({ memes: [] })
      .set('content-type', 'application/json');
    expect(res.status).toBe(400);
  });

  it('POST /meme/batch returns JSON results', async () => {
    const res = await request(app)
      .post('/meme/batch')
      .send({
        memes: [
          { template: 'drake', topText: 'a', bottomText: 'b' },
          { template: 'doge', topText: 'c', bottomText: 'd' }
        ]
      })
      .set('content-type', 'application/json');
    expect(res.status).toBe(200);
    expect(res.body.successful).toBe(2);
    expect(res.body.failed).toBe(0);
  });
});
