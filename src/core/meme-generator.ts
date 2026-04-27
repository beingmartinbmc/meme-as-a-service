import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import sharp from 'sharp';
import { MemeOptions, MemeTemplate, MemeResult, TextBox } from '../types';
import {
  getTemplate,
  setTemplatesDirectory,
  invalidateCustomTemplatesCache,
  listTemplates
} from '../templates';
import { sanitizeText, wrapText } from '../utils/text';
import { getConfig } from '../config';

const DEFAULT_FONT_STACK = 'Impact, \'Anton\', \'Oswald\', \'Helvetica Neue\', Helvetica, Arial, sans-serif';

export type OutputFormat = 'png' | 'jpeg' | 'jpg' | 'webp' | 'avif';

function normalizeFormat(fmt?: string): OutputFormat {
  const f = (fmt || 'png').toLowerCase();
  if (f === 'png' || f === 'jpeg' || f === 'jpg' || f === 'webp' || f === 'avif') {
    return f as OutputFormat;
  }
  return 'png';
}

function encode(image: sharp.Sharp, format: OutputFormat, quality?: number): sharp.Sharp {
  switch (format) {
    case 'jpeg':
    case 'jpg':
      return image.jpeg({ quality: quality ?? 90, mozjpeg: true });
    case 'webp':
      return image.webp({ quality: quality ?? 90 });
    case 'avif':
      return image.avif({ quality: quality ?? 60 });
    case 'png':
    default:
      return image.png({ compressionLevel: 9 });
  }
}

export class MemeGenerator {
  private templatesPath: string;

  constructor(templatesPath?: string) {
    this.templatesPath = templatesPath || path.join(__dirname, '../../templates');
    setTemplatesDirectory(this.templatesPath);
  }

  async generateMeme(options: MemeOptions): Promise<MemeResult> {
    const template = getTemplate(options.template);
    if (!template) {
      throw new Error(`Template '${options.template}' not found`);
    }

    const imagePath = path.join(this.templatesPath, template.imagePath);
    if (!(await fs.pathExists(imagePath))) {
      throw new Error(`Template image not found: ${imagePath}`);
    }

    const image = sharp(imagePath);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image metadata');
    }

    const svgOverlay = this.createTextOverlay(template, options, metadata.width, metadata.height);
    const format = normalizeFormat(options.format);

    const composed = image.composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0
      }
    ]);

    const buffer = await encode(composed, format, options.quality).toBuffer();

    return {
      buffer,
      format: format === 'jpg' ? 'jpeg' : format,
      width: metadata.width,
      height: metadata.height,
      template: options.template,
      options
    };
  }

  async generateMemeAndSave(options: MemeOptions, filename?: string): Promise<{ result: MemeResult; filePath: string }> {
    const result = await this.generateMeme(options);

    // Get configuration
    const config = await getConfig();
    await config.ensureOutputDirectory();

    const ext = result.format === 'jpeg' ? 'jpg' : result.format;
    const outputFilename = filename || `${options.template}-${Date.now()}.${ext}`;
    const outputPath = path.join(config.getOutputDirectory(), outputFilename);

    // Save the meme
    await fs.writeFile(outputPath, result.buffer);

    return { result, filePath: outputPath };
  }

  private createTextOverlay(
    template: MemeTemplate,
    options: MemeOptions,
    actualWidth: number,
    actualHeight: number
  ): string {
    const topText = sanitizeText(options.topText || '');
    const bottomText = sanitizeText(options.bottomText || '');

    const fontFamily = options.fontFamily
      ? `${options.fontFamily}, ${DEFAULT_FONT_STACK}`
      : DEFAULT_FONT_STACK;
    const baseFontSize = options.fontSize || 40;
    const textColor = options.textColor || '#FFFFFF';
    const strokeColor = options.strokeColor || '#000000';
    const strokeWidth = options.strokeWidth ?? 2;

    const scaleX = actualWidth / template.width;
    const scaleY = actualHeight / template.height;
    const scale = Math.min(scaleX, scaleY);

    const renderBox = (box: TextBox, text: string, anchor: 'top' | 'bottom') => {
      const cx = (box.x + box.width / 2) * scaleX;
      const fontSize = (box.fontSize || baseFontSize) * scale;
      const lineHeight = fontSize * 1.15;
      const maxWidth = (box.maxWidth || box.width) * scaleX;
      const lines = wrapText(text, maxWidth, fontSize);
      const totalHeight = lines.length * lineHeight;

      const startY =
        anchor === 'top'
          ? box.y * scaleY + fontSize
          : (box.y + box.height) * scaleY - totalHeight + fontSize;

      return lines
        .map((line, idx) => {
          const y = startY + idx * lineHeight;
          return (
            `<text x="${cx.toFixed(2)}" y="${y.toFixed(2)}" ` +
            `font-family="${fontFamily}" ` +
            `font-size="${fontSize.toFixed(2)}" ` +
            `font-weight="bold" ` +
            `text-anchor="middle" ` +
            `fill="${textColor}" ` +
            `stroke="${strokeColor}" ` +
            `stroke-width="${strokeWidth}" ` +
            `paint-order="stroke fill" ` +
            `stroke-linejoin="round">` +
            `${this.escapeSvgText(line)}</text>`
          );
        })
        .join('');
    };

    let svgElements = '';
    if (topText && template.textBoxes.top) {
      svgElements += renderBox(template.textBoxes.top, topText, 'top');
    }
    if (bottomText && template.textBoxes.bottom) {
      svgElements += renderBox(template.textBoxes.bottom, bottomText, 'bottom');
    }

    return `<svg width="${actualWidth}" height="${actualHeight}" xmlns="http://www.w3.org/2000/svg">${svgElements}</svg>`;
  }

  private escapeSvgText(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async generateBatchMemes(options: {
    templates: string[];
    texts: Array<{ topText?: string; bottomText?: string }>;
    globalOptions?: Partial<MemeOptions>;
  }): Promise<{
    results: MemeResult[];
    errors: Array<{ template: string; error: string }>;
  }> {
    const results: MemeResult[] = [];
    const errors: Array<{ template: string; error: string }> = [];

    for (const template of options.templates) {
      for (const text of options.texts) {
        try {
          const memeOptions: MemeOptions = {
            template,
            topText: text.topText,
            bottomText: text.bottomText,
            ...options.globalOptions
          };

          const result = await this.generateMeme(memeOptions);
          results.push(result);
        } catch (error) {
          errors.push({
            template,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }

    return { results, errors };
  }

  async generateBatchMemesAndSave(options: {
    templates: string[];
    texts: Array<{ topText?: string; bottomText?: string }>;
    globalOptions?: Partial<MemeOptions>;
    outputDirectory?: string;
  }): Promise<{
    results: Array<{ result: MemeResult; filePath: string }>;
    errors: Array<{ template: string; error: string }>;
  }> {
    const results: Array<{ result: MemeResult; filePath: string }> = [];
    const errors: Array<{ template: string; error: string }> = [];

    // Get configuration
    const config = await getConfig();
    const outputDir = options.outputDirectory || config.getOutputDirectory();
    await fs.ensureDir(outputDir);

    for (const template of options.templates) {
      for (const text of options.texts) {
        try {
          const memeOptions: MemeOptions = {
            template,
            topText: text.topText,
            bottomText: text.bottomText,
            ...options.globalOptions
          };

          const result = await this.generateMeme(memeOptions);
          const ext = result.format === 'jpeg' ? 'jpg' : result.format;
          const rand = crypto.randomBytes(4).toString('hex');
          const filename = `${template}-${Date.now()}-${rand}.${ext}`;
          const filePath = path.join(outputDir, filename);

          await fs.writeFile(filePath, result.buffer);
          results.push({ result, filePath });
        } catch (error) {
          errors.push({
            template,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }

    return { results, errors };
  }

  async addCustomTemplate(
    name: string,
    imagePath: string,
    textBoxes: { top?: TextBox; bottom?: TextBox },
    templateMetadata?: { description?: string; tags?: string[] }
  ): Promise<void> {
    // Validate template
    if (!await fs.pathExists(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    // Copy image to templates directory
    const templateDir = path.join(this.templatesPath, 'custom');
    await fs.ensureDir(templateDir);

    const fileName = `${name}.png`;
    const destPath = path.join(templateDir, fileName);
    await fs.copy(imagePath, destPath);

    // Load image to get dimensions
    const image = sharp(destPath);
    const imageMetadata = await image.metadata();

    if (!imageMetadata.width || !imageMetadata.height) {
      throw new Error('Invalid image metadata');
    }

    // Create template definition
    const template: MemeTemplate = {
      name,
      imagePath: `custom/${fileName}`,
      width: imageMetadata.width,
      height: imageMetadata.height,
      textBoxes,
      description: templateMetadata?.description,
      tags: templateMetadata?.tags
    };

    // Save template definition
    const templatesFile = path.join(this.templatesPath, 'custom-templates.json');
    let customTemplates: Record<string, MemeTemplate> = {};

    if (await fs.pathExists(templatesFile)) {
      customTemplates = await fs.readJson(templatesFile);
    }

    customTemplates[name] = template;
    await fs.writeJson(templatesFile, customTemplates, { spaces: 2 });
    invalidateCustomTemplatesCache();
  }

  getAvailableTemplates(): string[] {
    return listTemplates();
  }
}
