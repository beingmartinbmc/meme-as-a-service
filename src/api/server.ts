import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import JSZip from 'jszip';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import { ZodError } from 'zod';
import { generateMeme, getAvailableTemplates, searchAvailableTemplates, getTemplateInfo, addCustomTemplate } from '../index';
import { MemeOptions } from '../types';
import {
  memeOptionsSchema,
  batchRequestSchema,
  templateNameSchema,
  customTemplateSchema,
  textBoxSchema
} from './schemas';
import { openapiDocument, swaggerHtml } from './openapi';

import pkg from '../../package.json';

const MIME_BY_FORMAT: Record<string, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif'
};

const app = express();

// Multer with size + type guards. Files land in the OS temp dir, not cwd.
const upload = multer({
  dest: path.join(os.tmpdir(), 'meme-as-a-service-uploads'),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error('Only PNG/JPEG/WEBP/GIF images are accepted') as unknown as null, false);
  }
});

// Trust the first proxy hop so rate-limit + req.ip work behind ingress/nginx.
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '512kb' }));
app.use(express.urlencoded({ extended: true, limit: '512kb' }));

// Skip access logs in tests; structured-ish single-line logs in dev/prod.
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Default limiter: 60 req/min per IP. Heavier limits on generation routes.
// Disabled in test mode to keep the suite fast and deterministic.
const noopLimiter: express.RequestHandler = (_req, _res, next) => next();
const isTest = process.env.NODE_ENV === 'test';

const defaultLimiter = isTest
  ? noopLimiter
  : rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false });
const generateLimiter = isTest
  ? noopLimiter
  : rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false });
const batchLimiter = isTest
  ? noopLimiter
  : rateLimit({ windowMs: 60_000, max: 5, standardHeaders: true, legacyHeaders: false });

app.use(defaultLimiter);

function sendValidationError(res: express.Response, err: unknown): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', issues: err.issues });
    return;
  }
  res.status(400).json({
    error: 'Validation failed',
    message: err instanceof Error ? err.message : String(err)
  });
}

// Root → docs redirect
app.get('/', (_req, res) => res.redirect('/docs'));

// OpenAPI + Swagger UI
app.get('/openapi.json', (_req, res) => res.json(openapiDocument));
app.get('/docs', (_req, res) => res.type('html').send(swaggerHtml));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: pkg.version });
});

// Get available templates
app.get('/templates', (req, res) => {
  try {
    const { search } = req.query;
    let templates: string[];

    if (search && typeof search === 'string') {
      templates = searchAvailableTemplates(search);
    } else {
      templates = getAvailableTemplates();
    }

    const templatesWithInfo = templates.map((id) => {
      const info = getTemplateInfo(id);
      return { id, ...info };
    });

    res.json({
      templates: templatesWithInfo,
      total: templatesWithInfo.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get templates',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get template info
app.get('/templates/:template', (req, res) => {
  try {
    const { template } = req.params;
    const info = getTemplateInfo(template);

    if (!info) {
      return res.status(404).json({
        error: 'Template not found',
        message: `Template '${template}' does not exist`
      });
    }

    res.json(info);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get template info',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// IMPORTANT: register batch route BEFORE :template, otherwise "batch" is parsed
// as a template name.
app.post('/meme/batch', batchLimiter, async (req, res) => {
  let parsed;
  try {
    parsed = batchRequestSchema.parse(req.body);
  } catch (err) {
    return sendValidationError(res, err);
  }

  const { memes, outputFormat = 'json' } = parsed;
  const results: Array<{ index: number; template: string; buffer: Buffer; format: string }> = [];
  const errors: Array<{ index: number; template: string; error: string }> = [];

  await Promise.all(
    memes.map(async (memeConfig, i) => {
      try {
        const buffer = await generateMeme(memeConfig as MemeOptions);
        const format = (memeConfig.format || 'png').toLowerCase();
        results.push({ index: i, template: memeConfig.template, buffer, format });
      } catch (error) {
        errors.push({
          index: i,
          template: memeConfig.template,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    })
  );

  if (outputFormat === 'zip') {
    const zip = new JSZip();
    for (const r of results) {
      const ext = r.format === 'jpeg' ? 'jpg' : r.format;
      zip.file(`${String(r.index).padStart(3, '0')}-${r.template}.${ext}`, r.buffer);
    }
    if (errors.length) {
      zip.file('errors.json', JSON.stringify(errors, null, 2));
    }
    const zipBuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="memes.zip"');
    return res.send(zipBuf);
  }

  return res.json({
    results: results.map((r) => ({
      index: r.index,
      template: r.template,
      format: r.format,
      buffer: r.buffer.toString('base64')
    })),
    errors,
    total: memes.length,
    successful: results.length,
    failed: errors.length
  });
});

// Generate meme via query params
app.get('/meme/:template', generateLimiter, async (req, res) => {
  let templateName: string;
  try {
    templateName = templateNameSchema.parse(req.params.template);
  } catch (err) {
    return sendValidationError(res, err);
  }

  let validated;
  try {
    validated = memeOptionsSchema.parse({
      topText: req.query.top,
      bottomText: req.query.bottom,
      fontSize: req.query.fontSize,
      fontFamily: req.query.fontFamily,
      textColor: req.query.color,
      strokeColor: req.query.stroke,
      strokeWidth: req.query.strokeWidth,
      format: req.query.format,
      quality: req.query.quality
    });
  } catch (err) {
    return sendValidationError(res, err);
  }

  try {
    const buffer = await generateMeme({ template: templateName, ...validated } as MemeOptions);
    const fmt = (validated.format || 'png').toLowerCase();
    const ext = fmt === 'jpeg' ? 'jpg' : fmt;
    res.setHeader('Content-Type', MIME_BY_FORMAT[fmt] || 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="${templateName}-meme.${ext}"`);
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to generate meme',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Generate meme via JSON body
app.post('/meme/:template', generateLimiter, async (req, res) => {
  let templateName: string;
  try {
    templateName = templateNameSchema.parse(req.params.template);
  } catch (err) {
    return sendValidationError(res, err);
  }

  let validated;
  try {
    validated = memeOptionsSchema.parse(req.body || {});
  } catch (err) {
    return sendValidationError(res, err);
  }

  try {
    const buffer = await generateMeme({ template: templateName, ...validated } as MemeOptions);
    const fmt = (validated.format || 'png').toLowerCase();
    const ext = fmt === 'jpeg' ? 'jpg' : fmt;
    res.setHeader('Content-Type', MIME_BY_FORMAT[fmt] || 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="${templateName}-meme.${ext}"`);
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to generate meme',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Add custom template (multipart upload)
app.post('/templates/upload', upload.single('image'), async (req, res) => {
  let validated;
  try {
    validated = customTemplateSchema.parse(req.body || {});
  } catch (err) {
    if (req.file) await fs.remove(req.file.path).catch(() => undefined);
    return sendValidationError(res, err);
  }

  const imageFile = req.file;
  if (!imageFile) {
    return res.status(400).json({ error: 'Missing required fields', message: 'image file is required' });
  }

  try {
    const textBoxes: { top?: unknown; bottom?: unknown } = {};
    if (validated.topBox) textBoxes.top = textBoxSchema.parse(JSON.parse(validated.topBox));
    if (validated.bottomBox) textBoxes.bottom = textBoxSchema.parse(JSON.parse(validated.bottomBox));

    const metadata = {
      description: validated.description,
      tags: validated.tags ? validated.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined
    };

    await addCustomTemplate(validated.name, imageFile.path, textBoxes, metadata);
    return res.json({ message: 'Template added successfully', template: validated.name });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to add template',
      message: error instanceof Error ? error.message : String(error)
    });
  } finally {
    await fs.remove(imageFile.path).catch(() => undefined);
  }
});

// Backwards compatibility: old POST /templates path
app.post('/templates', upload.single('image'), (req, _res, _next) => {
  req.url = '/templates/upload';
  _next();
});

// Serve static files (for demo purposes)
app.use('/static', express.static(path.join(__dirname, '../../public')));

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message || 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

export default app;
