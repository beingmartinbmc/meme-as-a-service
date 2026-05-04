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
import { sanitizeText, wrapText, calculateFontSize } from '../utils/text';
import { getConfig } from '../config';
import { getCachedRender, setCachedRender } from './render-cache';
import { memesRenderedTotal, memeRenderDurationSeconds } from '../observability/metrics';
import { resolveBackground } from './background';

const DEFAULT_FONT_STACK = 'Impact, \'Anton\', \'Oswald\', \'Helvetica Neue\', Helvetica, Arial, sans-serif';

export type OutputFormat = 'png' | 'jpeg' | 'jpg' | 'webp' | 'avif';

function normalizeFormat(fmt?: string): OutputFormat {
  const f = (fmt || 'png').toLowerCase();
  if (f === 'png' || f === 'jpeg' || f === 'jpg' || f === 'webp' || f === 'avif') {
    return f as OutputFormat;
  }
  return 'png';
}

function normalizeColorOption(
  value: string | string[] | undefined,
  fallback: string
): string[] {
  if (Array.isArray(value)) {
    const filtered = value.filter((s) => typeof s === 'string' && s.length > 0);
    return filtered.length > 0 ? filtered : [fallback];
  }
  if (typeof value === 'string' && value.length > 0) return [value];
  return [fallback];
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
    const cached = getCachedRender(options);
    if (cached) {
      memesRenderedTotal.inc({ template: options.template, cached: 'true' });
      return cached;
    }

    const endTimer = memeRenderDurationSeconds.startTimer({
      template: options.template
    });

    try {
      const template = getTemplate(options.template);
      if (!template) {
        throw new Error(`Template '${options.template}' not found`);
      }

      let image: sharp.Sharp;
      if (options.background) {
        const bgBuffer = await resolveBackground(options.background);
        image = sharp(bgBuffer);
      } else {
        const imagePath = path.join(this.templatesPath, template.imagePath);
        if (!(await fs.pathExists(imagePath))) {
          throw new Error(`Template image not found: ${imagePath}`);
        }
        image = sharp(imagePath);
      }
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

      const result: MemeResult = {
        buffer,
        format: format === 'jpg' ? 'jpeg' : format,
        width: metadata.width,
        height: metadata.height,
        template: options.template,
        options
      };

      setCachedRender(options, result);
      memesRenderedTotal.inc({ template: options.template, cached: 'false' });
      return result;
    } finally {
      endTimer();
    }
  }

  async generateMemeAndSave(options: MemeOptions, filename?: string): Promise<{ result: MemeResult; filePath: string }> {
    const result = await this.generateMeme(options);

    // Get configuration
    const config = await getConfig();
    await config.ensureOutputDirectory();

    const ext = result.format === 'jpeg' ? 'jpg' : result.format;
    const rand = crypto.randomBytes(4).toString('hex');
    const outputFilename = filename || `${options.template}-${Date.now()}-${rand}.${ext}`;
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
    const fontFamily = options.fontFamily
      ? `${options.fontFamily}, ${DEFAULT_FONT_STACK}`
      : DEFAULT_FONT_STACK;
    const baseFontSize = options.fontSize || 40;
    const strokeWidth = options.strokeWidth ?? 2;

    const textColors = normalizeColorOption(options.textColor, '#FFFFFF');
    const strokeColors = normalizeColorOption(options.strokeColor, '#000000');

    const scaleX = actualWidth / template.width;
    const scaleY = actualHeight / template.height;
    const scale = Math.min(scaleX, scaleY);

    // Choose boxes: prefer top/bottom, then additional mid boxes in
    // insertion order. This matches the natural reading flow.
    const orderedBoxes: { key: string; box: TextBox; anchor: 'top' | 'bottom' }[] = [];
    if (template.textBoxes.top) {
      orderedBoxes.push({ key: 'top', box: template.textBoxes.top, anchor: 'top' });
    }
    for (const [k, v] of Object.entries(template.textBoxes)) {
      if (k === 'top' || k === 'bottom' || !v) continue;
      orderedBoxes.push({ key: k, box: v, anchor: 'top' });
    }
    if (template.textBoxes.bottom) {
      orderedBoxes.push({ key: 'bottom', box: template.textBoxes.bottom, anchor: 'bottom' });
    }

    // Distribute user-supplied lines/text across those boxes.
    const boxTexts: string[] = new Array(orderedBoxes.length).fill('');
    if (options.lines && options.lines.length > 0) {
      for (let i = 0; i < Math.min(options.lines.length, orderedBoxes.length); i++) {
        boxTexts[i] = sanitizeText(options.lines[i] || '');
      }
    } else {
      const topIdx = orderedBoxes.findIndex((b) => b.key === 'top');
      const botIdx = orderedBoxes.findIndex((b) => b.key === 'bottom');
      if (topIdx >= 0) boxTexts[topIdx] = sanitizeText(options.topText || '');
      if (botIdx >= 0) boxTexts[botIdx] = sanitizeText(options.bottomText || '');
    }

    let svgElements = '';
    for (let i = 0; i < orderedBoxes.length; i++) {
      const text = boxTexts[i];
      if (!text) continue;
      const { box, anchor } = orderedBoxes[i];
      const textColor = textColors[i % textColors.length];
      const strokeColor = strokeColors[i % strokeColors.length];

      const cx = (box.x + box.width / 2) * scaleX;
      const requestedSize = (box.fontSize || baseFontSize) * scale;
      const maxWidth = (box.maxWidth || box.width) * scaleX;
      const maxHeight = box.height * scaleY;
      const fontSize = calculateFontSize(
        text,
        maxWidth,
        maxHeight,
        Math.max(12, Math.floor(requestedSize * 0.35)),
        Math.ceil(requestedSize)
      );
      const lineHeight = fontSize * 1.15;
      const lines = wrapText(text, maxWidth, fontSize);
      const totalHeight = lines.length * lineHeight;
      const startY =
        anchor === 'top'
          ? box.y * scaleY + fontSize
          : (box.y + box.height) * scaleY - totalHeight + fontSize;

      svgElements += lines
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
