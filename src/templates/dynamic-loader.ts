import * as fs from 'fs-extra';
import * as path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import { MemeTemplate, TextBox } from '../types';
import { invalidateCustomTemplatesCache } from './index';
import { invalidateRenderCache } from '../core/render-cache';

export interface TemplateSource {
  name: string;
  url: string;
  description?: string;
}

const VALID_NAME = /^[a-zA-Z0-9_-]+$/;

function assertSafeTemplateName(name: string): void {
  if (!VALID_NAME.test(name)) {
    throw new Error(
      `Invalid template name '${name}'. Allowed: [a-zA-Z0-9_-].`
    );
  }
}

function resolveSafe(baseDir: string, relative: string): string {
  const resolved = path.resolve(baseDir, relative);
  const normalizedBase = path.resolve(baseDir);
  if (
    resolved !== normalizedBase &&
    !resolved.startsWith(normalizedBase + path.sep)
  ) {
    throw new Error('Template path escapes templates directory');
  }
  return resolved;
}

export class DynamicTemplateLoader {
  private templatesPath: string;
  private customTemplatesFile: string;

  constructor(templatesPath?: string) {
    this.templatesPath = templatesPath || path.join(__dirname, '../../templates');
    this.customTemplatesFile = path.join(this.templatesPath, 'custom-templates.json');
  }

  async loadCustomTemplates(): Promise<Record<string, MemeTemplate>> {
    try {
      if (await fs.pathExists(this.customTemplatesFile)) {
        return await fs.readJson(this.customTemplatesFile);
      }
    } catch (error) {
      console.warn('Failed to load custom templates:', error);
    }
    return {};
  }

  async addTemplateFromUrl(source: TemplateSource): Promise<boolean> {
    try {
      assertSafeTemplateName(source.name);
      console.log(`Downloading template: ${source.name}`);

      // Download the template image
      const response = await axios({
        method: 'GET',
        url: source.url,
        responseType: 'arraybuffer',
        timeout: 10000
      });

      await fs.ensureDir(this.templatesPath);
      const imagePath = resolveSafe(this.templatesPath, `${source.name}.png`);
      await fs.writeFile(imagePath, response.data);

      const meta = await sharp(imagePath).metadata();
      const width = meta.width || 800;
      const height = meta.height || 600;

      const template: MemeTemplate = {
        name: source.name,
        imagePath: `${source.name}.png`,
        width,
        height,
        description: source.description || `${source.name} meme template`,
        tags: [source.name, 'custom'],
        textBoxes: {
          top: {
            x: Math.round(width * 0.05),
            y: Math.round(height * 0.05),
            width: Math.round(width * 0.9),
            height: Math.round(height * 0.2),
            fontSize: Math.max(24, Math.round(height * 0.07)),
            fontFamily: 'Impact',
            textColor: '#FFFFFF',
            strokeColor: '#000000',
            strokeWidth: 2,
            maxWidth: Math.round(width * 0.85)
          },
          bottom: {
            x: Math.round(width * 0.05),
            y: Math.round(height * 0.75),
            width: Math.round(width * 0.9),
            height: Math.round(height * 0.2),
            fontSize: Math.max(24, Math.round(height * 0.07)),
            fontFamily: 'Impact',
            textColor: '#FFFFFF',
            strokeColor: '#000000',
            strokeWidth: 2,
            maxWidth: Math.round(width * 0.85)
          }
        }
      };

      // Load existing custom templates
      const customTemplates = await this.loadCustomTemplates();
      customTemplates[source.name] = template;

      await fs.writeJson(this.customTemplatesFile, customTemplates, { spaces: 2 });
      invalidateCustomTemplatesCache();
      invalidateRenderCache();

      console.log(`Added template: ${source.name}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to add template ${source.name}:`, error);
      return false;
    }
  }

  async addTemplateFromFile(
    name: string,
    imagePath: string,
    textBoxes: { top?: Partial<TextBox>; bottom?: Partial<TextBox> },
    metadata?: { description?: string; tags?: string[] }
  ): Promise<boolean> {
    try {
      assertSafeTemplateName(name);
      await fs.ensureDir(this.templatesPath);
      const destPath = resolveSafe(this.templatesPath, `${name}.png`);
      await fs.copy(imagePath, destPath);

      const meta = await sharp(destPath).metadata();
      const width = meta.width || 800;
      const height = meta.height || 600;

      const template: MemeTemplate = {
        name,
        imagePath: `${name}.png`,
        width,
        height,
        textBoxes: textBoxes as { top?: TextBox; bottom?: TextBox },
        description: metadata?.description,
        tags: metadata?.tags || [name, 'custom']
      };

      const customTemplates = await this.loadCustomTemplates();
      customTemplates[name] = template;
      await fs.writeJson(this.customTemplatesFile, customTemplates, { spaces: 2 });
      invalidateCustomTemplatesCache();
      invalidateRenderCache();

      console.log(`Added template: ${name}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to add template ${name}:`, error);
      return false;
    }
  }

  async removeTemplate(name: string): Promise<boolean> {
    try {
      assertSafeTemplateName(name);
      // Load existing custom templates
      const customTemplates = await this.loadCustomTemplates();

      if (!customTemplates[name]) {
        console.warn(`Template ${name} not found`);
        return false;
      }

      // Remove image file
      const imagePath = resolveSafe(this.templatesPath, `${name}.png`);
      if (await fs.pathExists(imagePath)) {
        await fs.remove(imagePath);
      }

      delete customTemplates[name];
      await fs.writeJson(this.customTemplatesFile, customTemplates, { spaces: 2 });
      invalidateCustomTemplatesCache();
      invalidateRenderCache();

      console.log(`Removed template: ${name}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to remove template ${name}:`, error);
      return false;
    }
  }

  async listCustomTemplates(): Promise<string[]> {
    const customTemplates = await this.loadCustomTemplates();
    return Object.keys(customTemplates);
  }
}
