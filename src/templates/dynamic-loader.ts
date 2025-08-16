import * as fs from 'fs-extra';
import * as path from 'path';
import axios from 'axios';
import { MemeTemplate } from '../types';

export interface TemplateSource {
  name: string;
  url: string;
  description?: string;
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
      console.log(`📥 Downloading template: ${source.name}`);
      
      // Download the template image
      const response = await axios({
        method: 'GET',
        url: source.url,
        responseType: 'arraybuffer',
        timeout: 10000
      });

      const imagePath = path.join(this.templatesPath, `${source.name}.png`);
      await fs.writeFile(imagePath, response.data);

      // Create a basic template definition
      const template: MemeTemplate = {
        name: source.name,
        imagePath: `${source.name}.png`,
        width: 800, // Default size, will be updated
        height: 600,
        description: source.description || `${source.name} meme template`,
        tags: [source.name, 'custom'],
        textBoxes: {
          top: {
            x: 400,
            y: 50,
            width: 350,
            height: 200,
            fontSize: 35,
            fontFamily: 'Impact',
            textColor: '#FFFFFF',
            strokeColor: '#000000',
            strokeWidth: 2,
            maxWidth: 330
          }
        }
      };

      // Load existing custom templates
      const customTemplates = await this.loadCustomTemplates();
      customTemplates[source.name] = template;

      // Save updated templates
      await fs.writeJson(this.customTemplatesFile, customTemplates, { spaces: 2 });

      console.log(`✅ Added template: ${source.name}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to add template ${source.name}:`, error);
      return false;
    }
  }

  async addTemplateFromFile(
    name: string,
    imagePath: string,
    textBoxes: { top?: any; bottom?: any },
    metadata?: { description?: string; tags?: string[] }
  ): Promise<boolean> {
    try {
      // Copy image to templates directory
      const destPath = path.join(this.templatesPath, `${name}.png`);
      await fs.copy(imagePath, destPath);

      // Create template definition
      const template: MemeTemplate = {
        name,
        imagePath: `${name}.png`,
        width: 800, // Will be updated with actual dimensions
        height: 600,
        textBoxes,
        description: metadata?.description,
        tags: metadata?.tags || [name, 'custom']
      };

      // Load existing custom templates
      const customTemplates = await this.loadCustomTemplates();
      customTemplates[name] = template;

      // Save updated templates
      await fs.writeJson(this.customTemplatesFile, customTemplates, { spaces: 2 });

      console.log(`✅ Added template: ${name}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to add template ${name}:`, error);
      return false;
    }
  }

  async removeTemplate(name: string): Promise<boolean> {
    try {
      // Load existing custom templates
      const customTemplates = await this.loadCustomTemplates();
      
      if (!customTemplates[name]) {
        console.warn(`Template ${name} not found`);
        return false;
      }

      // Remove image file
      const imagePath = path.join(this.templatesPath, `${name}.png`);
      if (await fs.pathExists(imagePath)) {
        await fs.remove(imagePath);
      }

      // Remove from templates
      delete customTemplates[name];
      await fs.writeJson(this.customTemplatesFile, customTemplates, { spaces: 2 });

      console.log(`✅ Removed template: ${name}`);
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
