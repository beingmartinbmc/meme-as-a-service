// Static OpenAPI 3.0 description served at /openapi.json and rendered by /docs.
// Hand-written to avoid pulling in heavy generators.

import pkg from '../../package.json';

export const openapiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Meme-as-a-Service API',
    description: pkg.description,
    version: pkg.version,
    license: { name: 'MIT' }
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local dev' }],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                    version: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/templates': {
      get: {
        summary: 'List templates',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, required: false }
        ],
        responses: { '200': { description: 'Template list' } }
      }
    },
    '/templates/{template}': {
      get: {
        summary: 'Get template details',
        parameters: [
          { name: 'template', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Template metadata' },
          '404': { description: 'Template not found' }
        }
      }
    },
    '/meme/{template}': {
      get: {
        summary: 'Generate a meme via query parameters',
        parameters: [
          { name: 'template', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'top', in: 'query', schema: { type: 'string' } },
          { name: 'bottom', in: 'query', schema: { type: 'string' } },
          { name: 'fontSize', in: 'query', schema: { type: 'integer' } },
          { name: 'color', in: 'query', schema: { type: 'string' } },
          { name: 'stroke', in: 'query', schema: { type: 'string' } },
          { name: 'strokeWidth', in: 'query', schema: { type: 'integer' } },
          { name: 'format', in: 'query', schema: { type: 'string', enum: ['png', 'jpeg', 'webp', 'avif'] } },
          { name: 'quality', in: 'query', schema: { type: 'integer' } }
        ],
        responses: {
          '200': {
            description: 'Generated meme image',
            content: { 'image/*': { schema: { type: 'string', format: 'binary' } } }
          },
          '400': { description: 'Validation error' }
        }
      },
      post: {
        summary: 'Generate a meme via JSON body',
        parameters: [{ name: 'template', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MemeOptions' }
            }
          }
        },
        responses: {
          '200': { description: 'Generated meme image' },
          '400': { description: 'Validation error' }
        }
      }
    },
    '/meme/batch': {
      post: {
        summary: 'Generate multiple memes (JSON or ZIP)',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  memes: { type: 'array', items: { $ref: '#/components/schemas/BatchMeme' } },
                  outputFormat: { type: 'string', enum: ['json', 'zip'] }
                },
                required: ['memes']
              }
            }
          }
        },
        responses: {
          '200': { description: 'Batch result (JSON) or application/zip stream' },
          '400': { description: 'Validation error' }
        }
      }
    },
    '/templates/upload': {
      post: {
        summary: 'Upload a custom template',
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  tags: { type: 'string' },
                  topBox: { type: 'string', description: 'JSON-encoded TextBox' },
                  bottomBox: { type: 'string', description: 'JSON-encoded TextBox' },
                  image: { type: 'string', format: 'binary' }
                },
                required: ['name', 'image']
              }
            }
          }
        },
        responses: {
          '200': { description: 'Template added' },
          '400': { description: 'Validation error' }
        }
      }
    }
  },
  components: {
    schemas: {
      MemeOptions: {
        type: 'object',
        properties: {
          topText: { type: 'string' },
          bottomText: { type: 'string' },
          fontSize: { type: 'integer' },
          fontFamily: { type: 'string' },
          textColor: { type: 'string' },
          strokeColor: { type: 'string' },
          strokeWidth: { type: 'number' },
          format: { type: 'string', enum: ['png', 'jpeg', 'webp', 'avif'] },
          quality: { type: 'integer' }
        }
      },
      BatchMeme: {
        allOf: [
          { $ref: '#/components/schemas/MemeOptions' },
          { type: 'object', properties: { template: { type: 'string' } }, required: ['template'] }
        ]
      }
    }
  }
} as const;

export const swaggerHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Meme-as-a-Service API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger-ui' });
    </script>
  </body>
</html>`;
