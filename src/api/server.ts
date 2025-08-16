import express from 'express';
import cors from 'cors';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs-extra';
import { generateMeme, getAvailableTemplates, searchAvailableTemplates, getTemplateInfo, addCustomTemplate } from '../index';
import { MemeOptions } from '../types';

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
    
    const templatesWithInfo = templates.map(name => {
      const info = getTemplateInfo(name);
      return {
        name,
        ...info
      };
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

// Generate meme endpoint
app.get('/meme/:template', async (req, res) => {
  try {
    const { template } = req.params;
    const { top, bottom, fontSize, color, stroke, strokeWidth, quality } = req.query;
    
    const options: MemeOptions = {
      template,
      topText: top as string,
      bottomText: bottom as string,
      fontSize: fontSize ? parseInt(fontSize as string) : undefined,
      textColor: color as string,
      strokeColor: stroke as string,
      strokeWidth: strokeWidth ? parseInt(strokeWidth as string) : undefined,
      quality: quality ? parseInt(quality as string) : undefined
    };
    
    const buffer = await generateMeme(options);
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="${template}-meme.png"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate meme',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Generate meme with POST (for complex options)
app.post('/meme/:template', async (req, res) => {
  try {
    const { template } = req.params;
    const options: MemeOptions = {
      template,
      ...req.body
    };
    
    const buffer = await generateMeme(options);
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="${template}-meme.png"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate meme',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Batch meme generation
app.post('/meme/batch', async (req, res) => {
  try {
    const { memes, outputFormat = 'json' } = req.body;
    
    if (!Array.isArray(memes)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'memes must be an array'
      });
    }
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < memes.length; i++) {
      const memeConfig = memes[i];
      try {
        const buffer = await generateMeme(memeConfig);
        results.push({
          index: i,
          template: memeConfig.template,
          buffer: buffer.toString('base64'),
          success: true
        });
      } catch (error) {
        errors.push({
          index: i,
          template: memeConfig.template,
          error: error instanceof Error ? error.message : String(error),
          success: false
        });
      }
    }
    
    if (outputFormat === 'zip') {
      // TODO: Implement ZIP output for batch memes
      res.status(501).json({
        error: 'ZIP output not yet implemented',
        message: 'Please use JSON format for now'
      });
    } else {
      res.json({
        results,
        errors,
        total: memes.length,
        successful: results.length,
        failed: errors.length
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate batch memes',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Add custom template
app.post('/templates', upload.single('image'), async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    const imageFile = req.file;
    
    if (!name || !imageFile) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'name and image file are required'
      });
    }
    
    // Parse text boxes from request body
    const textBoxes = {
      top: req.body.topBox ? JSON.parse(req.body.topBox) : undefined,
      bottom: req.body.bottomBox ? JSON.parse(req.body.bottomBox) : undefined
    };
    
    const metadata = {
      description,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : undefined
    };
    
    await addCustomTemplate(name, imageFile.path, textBoxes, metadata);
    
    // Clean up uploaded file
    await fs.remove(imageFile.path);
    
    res.json({
      message: 'Template added successfully',
      template: name
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to add template',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Serve static files (for demo purposes)
app.use('/static', express.static(path.join(__dirname, '../../public')));

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
