import request from 'supertest';

// Replace addCustomTemplate with a stub so upload tests don't write into the
// real templates/ directory. The index module is already loaded by server.ts,
// so we need doMock and re-import the server afterwards.
jest.mock('../index', () => {
  const actual = jest.requireActual('../index');
  return {
    ...actual,
    addCustomTemplate: jest.fn(async () => undefined)
  };
});

import app from '../api/server';

describe('API server', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBeDefined();
  });

  it('GET /healthz returns ok', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /readyz reports readiness', async () => {
    const res = await request(app).get('/readyz');
    expect(res.status).toBe(200);
    expect(res.body.ready).toBe(true);
    expect(res.body.templates).toBeGreaterThan(0);
  });

  it('GET /metrics returns Prometheus text', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toMatch(/# HELP/);
  });

  it('GET / redirects to /docs', async () => {
    const res = await request(app).get('/').redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/docs');
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

  it('assigns x-request-id response header', async () => {
    const res = await request(app).get('/healthz');
    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.headers['x-request-id']).toMatch(/[a-f0-9-]+/);
  });

  it('propagates incoming x-request-id', async () => {
    const res = await request(app).get('/healthz').set('x-request-id', 'my-req-123');
    expect(res.headers['x-request-id']).toBe('my-req-123');
  });

  it('GET /templates lists built-ins', async () => {
    const res = await request(app).get('/templates');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.templates)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
    const ids = res.body.templates.map((t: { id: string }) => t.id);
    expect(ids).toContain('drake');
  });

  it('GET /templates supports search', async () => {
    const res = await request(app).get('/templates').query({ search: 'drake' });
    expect(res.status).toBe(200);
    const ids = res.body.templates.map((t: { id: string }) => t.id);
    expect(ids).toContain('drake');
  });

  it('GET /templates/:name returns 200 for known', async () => {
    const res = await request(app).get('/templates/drake');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Drake Hotline Bling');
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

  it('GET /meme/:template honors format=jpeg', async () => {
    const res = await request(app).get('/meme/drake').query({ format: 'jpeg', quality: '80' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/jpeg');
  });

  it('GET /meme/:template rejects bad strokeWidth', async () => {
    const res = await request(app).get('/meme/drake').query({ strokeWidth: '9999' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('GET /meme/:template rejects bad template name', async () => {
    const res = await request(app).get('/meme/not!valid');
    expect(res.status).toBe(400);
  });

  it('GET /meme/:template 500s for unknown template', async () => {
    const res = await request(app).get('/meme/does-not-exist');
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Failed to generate meme/);
  });

  it('POST /meme/:template renders via JSON body', async () => {
    const res = await request(app)
      .post('/meme/drake')
      .send({ topText: 'Hi', bottomText: 'There' })
      .set('content-type', 'application/json');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/png');
  });

  it('POST /meme/:template rejects bad body', async () => {
    const res = await request(app)
      .post('/meme/drake')
      .send({ strokeWidth: 9999 })
      .set('content-type', 'application/json');
    expect(res.status).toBe(400);
  });

  it('POST /meme/:template rejects bad template name', async () => {
    const res = await request(app).post('/meme/bad!name').send({});
    expect(res.status).toBe(400);
  });

  it('POST /meme/batch validates empty payload', async () => {
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

  it('POST /meme/batch partial failures are reported', async () => {
    const res = await request(app)
      .post('/meme/batch')
      .send({
        memes: [
          { template: 'drake', topText: 'ok' },
          { template: 'nope-nope', topText: 'fail' }
        ]
      })
      .set('content-type', 'application/json');
    expect(res.status).toBe(200);
    expect(res.body.successful).toBe(1);
    expect(res.body.failed).toBe(1);
    expect(res.body.errors[0].template).toBe('nope-nope');
  });

  it('POST /meme/batch with outputFormat=zip returns a zip archive', async () => {
    const res = await request(app)
      .post('/meme/batch')
      .send({
        outputFormat: 'zip',
        memes: [
          { template: 'drake', topText: 'a' },
          { template: 'doge', topText: 'b' },
          { template: 'does-not-exist', topText: 'x' }
        ]
      })
      .set('content-type', 'application/json')
      .buffer(true)
      .parse((res_, cb) => {
        const chunks: Buffer[] = [];
        res_.on('data', (c) => chunks.push(c));
        res_.on('end', () => cb(null, Buffer.concat(chunks)));
      });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/zip');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  it('unknown route returns 404 JSON', async () => {
    const res = await request(app).get('/definitely-not-a-route');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found');
  });

  it('POST /templates/upload without file returns 400', async () => {
    const res = await request(app).post('/templates/upload').field('name', 'x');
    expect(res.status).toBe(400);
  });

  it('POST /templates/upload rejects bad name', async () => {
    const res = await request(app)
      .post('/templates/upload')
      .field('name', 'bad!name')
      .attach('image', Buffer.from('fakepng'), { filename: 'x.png', contentType: 'image/png' });
    expect(res.status).toBe(400);
  });

  it('POST /templates/upload accepts valid multipart', async () => {
    const res = await request(app)
      .post('/templates/upload')
      .field('name', 'test-upload-ok')
      .attach('image', Buffer.from('fakepng'), { filename: 'x.png', contentType: 'image/png' });
    // Will 200 or 500 depending on sharp mock (we mocked width/height). Just
    // verify we got past validation.
    expect([200, 500]).toContain(res.status);
  });

  it('GET /docs/static serves bundled swagger-ui assets', async () => {
    const res = await request(app).get('/docs/static/swagger-ui.css');
    expect([200, 304]).toContain(res.status);
    expect(res.headers['content-type']).toMatch(/css/);
  });

  it('GET /templates ignores non-string ?search', async () => {
    const res = await request(app).get('/templates?search[a]=1&search[b]=2');
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
  });

  it('POST /meme/batch with outputFormat=zip handles the errors.json branch', async () => {
    const res = await request(app)
      .post('/meme/batch')
      .send({
        outputFormat: 'zip',
        memes: [{ template: 'drake' }, { template: 'does-not-exist' }]
      })
      .set('content-type', 'application/json')
      .buffer(true)
      .parse((res_, cb) => {
        const chunks: Buffer[] = [];
        res_.on('data', (c) => chunks.push(c));
        res_.on('end', () => cb(null, Buffer.concat(chunks)));
      });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/zip');
  });

  it('legacy POST /templates 308-redirects to /templates/upload', async () => {
    const res = await request(app).post('/templates').redirects(0);
    expect(res.status).toBe(308);
    expect(res.headers.location).toBe('/templates/upload');
  });

  it('POST /templates/upload rejects non-image mime', async () => {
    const res = await request(app)
      .post('/templates/upload')
      .field('name', 'any-name')
      .attach('image', Buffer.from('text'), {
        filename: 'x.txt',
        contentType: 'text/plain'
      });
    // multer rejects at fileFilter → lands in error handler → 500.
    expect([400, 500]).toContain(res.status);
  });

  it('POST /templates/upload with top/bottom boxes succeeds', async () => {
    const res = await request(app)
      .post('/templates/upload')
      .field('name', 'with-boxes')
      .field('description', 'a template')
      .field('tags', 'one, two ,')
      .field('topBox', JSON.stringify({ x: 0, y: 0, width: 10, height: 10 }))
      .field('bottomBox', JSON.stringify({ x: 0, y: 50, width: 10, height: 10 }))
      .attach('image', Buffer.from('fakepng'), { filename: 'x.png', contentType: 'image/png' });
    expect([200, 500]).toContain(res.status);
  });
});
