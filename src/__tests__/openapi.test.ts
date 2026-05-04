import { buildOpenApiDocument, openapiDocument, swaggerHtml } from '../api/openapi';

describe('openapi', () => {
  it('is an OpenAPI 3.x document', () => {
    expect(openapiDocument.openapi).toMatch(/^3\./);
    expect(openapiDocument.info.title).toBe('Meme-as-a-Service API');
  });

  it('exposes the paths we implement', () => {
    const paths = Object.keys(openapiDocument.paths || {});
    expect(paths).toEqual(
      expect.arrayContaining([
        '/healthz',
        '/readyz',
        '/metrics',
        '/templates',
        '/templates/{template}',
        '/meme/{template}',
        '/meme/batch',
        '/templates/upload'
      ])
    );
  });

  it('buildOpenApiDocument is deterministic', () => {
    const a = buildOpenApiDocument();
    const b = buildOpenApiDocument();
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('swaggerHtml references local swagger-ui assets', () => {
    expect(swaggerHtml).toContain('/docs/static/swagger-ui.css');
    expect(swaggerHtml).toContain('/docs/static/swagger-ui-bundle.js');
    expect(swaggerHtml).not.toContain('unpkg.com');
  });
});
