import { z } from 'zod';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi
} from '@asteasolutions/zod-to-openapi';

import pkg from '../../package.json';
import {
  memeOptionsSchema,
  batchRequestSchema,
  templateNameSchema,
  textBoxSchema
} from './schemas';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const MemeOptionsSchema = registry.register('MemeOptions', memeOptionsSchema);
const BatchRequestSchema = registry.register('BatchRequest', batchRequestSchema);
const TextBoxSchema = registry.register('TextBox', textBoxSchema);

const HealthResponse = registry.register(
  'HealthResponse',
  z.object({
    status: z.string().openapi({ example: 'ok' }),
    timestamp: z.string(),
    version: z.string()
  })
);

const ReadyResponse = registry.register(
  'ReadyResponse',
  z.object({
    ready: z.boolean(),
    templates: z.number().int().nonnegative()
  })
);

const ValidationErrorResponse = registry.register(
  'ValidationError',
  z.object({
    error: z.string(),
    message: z.string().optional(),
    issues: z.array(z.unknown()).optional()
  })
);

const TemplateInfo = registry.register(
  'TemplateInfo',
  z.object({
    id: z.string(),
    name: z.string(),
    imagePath: z.string(),
    width: z.number().int(),
    height: z.number().int(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    textBoxes: z.object({ top: TextBoxSchema.optional(), bottom: TextBoxSchema.optional() })
  })
);

registry.registerPath({
  method: 'get',
  path: '/healthz',
  summary: 'Liveness probe',
  responses: {
    200: {
      description: 'Service is alive',
      content: { 'application/json': { schema: HealthResponse } }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/readyz',
  summary: 'Readiness probe',
  responses: {
    200: {
      description: 'Service is ready',
      content: { 'application/json': { schema: ReadyResponse } }
    },
    503: { description: 'Service not ready' }
  }
});

registry.registerPath({
  method: 'get',
  path: '/metrics',
  summary: 'Prometheus metrics',
  responses: {
    200: {
      description: 'Prometheus text format',
      content: { 'text/plain': { schema: z.string() } }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/templates',
  summary: 'List templates',
  request: {
    query: z.object({ search: z.string().optional() })
  },
  responses: {
    200: {
      description: 'Template list',
      content: {
        'application/json': {
          schema: z.object({
            templates: z.array(TemplateInfo),
            total: z.number().int()
          })
        }
      }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/templates/{template}',
  summary: 'Get template details',
  request: {
    params: z.object({ template: templateNameSchema })
  },
  responses: {
    200: {
      description: 'Template metadata',
      content: { 'application/json': { schema: TemplateInfo } }
    },
    404: { description: 'Template not found' }
  }
});

registry.registerPath({
  method: 'get',
  path: '/meme/{template}',
  summary: 'Generate a meme via query parameters',
  request: {
    params: z.object({ template: templateNameSchema }),
    query: z.object({
      top: z.string().optional(),
      bottom: z.string().optional(),
      fontSize: z.string().optional(),
      color: z.string().optional(),
      stroke: z.string().optional(),
      strokeWidth: z.string().optional(),
      format: z.enum(['png', 'jpeg', 'webp', 'avif']).optional(),
      quality: z.string().optional()
    })
  },
  responses: {
    200: {
      description: 'Generated meme image',
      content: { 'image/png': { schema: z.string().openapi({ format: 'binary' }) } }
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ValidationErrorResponse } }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/images/{template}/{segments}',
  summary: 'Generate a meme via URL-as-state path (shareable)',
  description:
    'Path segments are decoded using memegen-style escapes: underscores → spaces, ~q → ?, ~n → newline, ~a → &, ~p → %, ~h → #, ~s → /, ~l → <, ~g → >, ~d → ", ~r → \'. The final segment may include an extension (.png/.jpeg/.webp/.avif) to pick the output format.',
  request: {
    params: z.object({
      template: templateNameSchema,
      segments: z.string().openapi({ description: 'Path tail like line1/line2.png' })
    })
  },
  responses: {
    200: { description: 'Generated meme image' },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ValidationErrorResponse } }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/preview/{template}',
  summary: 'Small thumbnail preview of a template with sample text',
  request: { params: z.object({ template: templateNameSchema }) },
  responses: {
    200: {
      description: 'WebP thumbnail',
      content: { 'image/webp': { schema: z.string().openapi({ format: 'binary' }) } }
    },
    404: { description: 'Template not found' }
  }
});

registry.registerPath({
  method: 'post',
  path: '/meme/{template}',
  summary: 'Generate a meme via JSON body',
  request: {
    params: z.object({ template: templateNameSchema }),
    body: { content: { 'application/json': { schema: MemeOptionsSchema } } }
  },
  responses: {
    200: { description: 'Generated meme image' },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ValidationErrorResponse } }
    }
  }
});

registry.registerPath({
  method: 'post',
  path: '/meme/batch',
  summary: 'Generate multiple memes (JSON or ZIP)',
  request: {
    body: { content: { 'application/json': { schema: BatchRequestSchema } } }
  },
  responses: {
    200: { description: 'Batch result (JSON) or application/zip stream' },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ValidationErrorResponse } }
    }
  }
});

registry.registerPath({
  method: 'post',
  path: '/templates/upload',
  summary: 'Upload a custom template',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            name: templateNameSchema,
            description: z.string().optional(),
            tags: z.string().optional(),
            topBox: z.string().optional(),
            bottomBox: z.string().optional(),
            image: z.string().openapi({ format: 'binary' })
          })
        }
      }
    }
  },
  responses: {
    200: { description: 'Template added' },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ValidationErrorResponse } }
    },
    401: { description: 'Missing or invalid API key' }
  }
});

export function buildOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'Meme-as-a-Service API',
      description: pkg.description,
      version: pkg.version,
      license: { name: 'MIT' }
    },
    servers: [{ url: 'http://localhost:3000', description: 'Local dev' }]
  });
}

export const openapiDocument = buildOpenApiDocument();

// Swagger UI shell served at /docs. Assets are served locally at /docs/static
// from swagger-ui-dist, so no CDN dependency.
export const swaggerHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Meme-as-a-Service API Docs</title>
    <link rel="stylesheet" href="/docs/static/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/docs/static/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger-ui' });
    </script>
  </body>
</html>`;
