import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { MemeOptions, MemeTemplate, MemeResult, TextBox } from '../types';
import { getTemplate } from '../templates';
import { sanitizeText } from '../utils/text';
import { getConfig } from '../config';

export class MemeGenerator {
  private templatesPath: string;

  constructor(templatesPath?: string) {
    this.templatesPath = templatesPath || path.join(__dirname, '../../templates');
  }

  async generateMeme(options: MemeOptions): Promise<MemeResult> {
    const template = getTemplate(options.template);
    if (!template) {
      throw new Error(`Template '${options.template}' not found`);
    }

    // Load template image
    const imagePath = path.join(this.templatesPath, template.imagePath);
    if (!await fs.pathExists(imagePath)) {
      throw new Error(`Template image not found: ${imagePath}`);
    }

    // Load the base image
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image metadata');
    }

    // Create SVG overlay for text
    const svgOverlay = this.createTextOverlay(template, options, metadata.width, metadata.height);
    
    // Composite the text overlay onto the image
    const buffer = await image
      .composite([{
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0
      }])
      .png()
      .toBuffer();

    return {
      buffer,
      format: 'png',
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
    
    // Generate filename if not provided
    const outputFilename = filename || `${options.template}-${Date.now()}.png`;
    const outputPath = path.join(config.getOutputDirectory(), outputFilename);
    
    // Save the meme
    await fs.writeFile(outputPath, result.buffer);
    
    return { result, filePath: outputPath };
  }

  private createTextOverlay(template: MemeTemplate, options: MemeOptions, actualWidth: number, actualHeight: number): string {
    const topText = sanitizeText(options.topText || '');
    const bottomText = sanitizeText(options.bottomText || '');
    
    const fontSize = options.fontSize || 40;
    const textColor = options.textColor || '#FFFFFF';
    const strokeColor = options.strokeColor || '#000000';
    const strokeWidth = options.strokeWidth || 2;
    
    let svgElements = '';
    
    // Calculate scaling factors if actual image dimensions differ from template
    const scaleX = actualWidth / template.width;
    const scaleY = actualHeight / template.height;
    
    // Add top text
    if (topText && template.textBoxes.top) {
      const textBox = template.textBoxes.top;
      const x = (textBox.x + textBox.width / 2) * scaleX;
      const y = (textBox.y + fontSize) * scaleY;
      const scaledFontSize = fontSize * Math.min(scaleX, scaleY);
      
      svgElements += `
        <text x="${x}" y="${y}" 
              font-family="Impact, Arial, sans-serif" 
              font-size="${scaledFontSize}" 
              text-anchor="middle" 
              fill="${textColor}"
              stroke="${strokeColor}" 
              stroke-width="${strokeWidth}">
          ${this.escapeSvgText(topText)}
        </text>
      `;
    }
    
    // Add bottom text
    if (bottomText && template.textBoxes.bottom) {
      const textBox = template.textBoxes.bottom;
      const x = (textBox.x + textBox.width / 2) * scaleX;
      const y = (textBox.y + textBox.height - fontSize / 2) * scaleY;
      const scaledFontSize = fontSize * Math.min(scaleX, scaleY);
      
      svgElements += `
        <text x="${x}" y="${y}" 
              font-family="Impact, Arial, sans-serif" 
              font-size="${scaledFontSize}" 
              text-anchor="middle" 
              fill="${textColor}"
              stroke="${strokeColor}" 
              stroke-width="${strokeWidth}">
          ${this.escapeSvgText(bottomText)}
        </text>
      `;
    }
    
    return `
      <svg width="${actualWidth}" height="${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        ${svgElements}
      </svg>
    `;
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
          const filename = `${template}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
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
  }

  getAvailableTemplates(): string[] {
    // This would need to be implemented to read from the templates directory
    // For now, return the built-in templates
    return ['drake', 'distracted-boyfriend', 'doge', 'two-buttons', 'change-my-mind', 'one-does-not-simply'];
  }
}
