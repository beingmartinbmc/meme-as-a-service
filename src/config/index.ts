import * as fs from 'fs-extra';
import * as path from 'path';
import { MemeConfig } from '../types';

const DEFAULT_CONFIG: MemeConfig = {
  outputDirectory: './memes',
  defaultFontSize: 40,
  defaultFontFamily: 'Impact',
  defaultTextColor: '#FFFFFF',
  defaultStrokeColor: '#000000',
  defaultStrokeWidth: 2,
  templatesPath: './templates'
};

export class ConfigManager {
  private configPath: string;
  private config: MemeConfig;

  constructor(configPath?: string) {
    this.configPath = configPath || path.join(process.cwd(), 'meme-config.json');
    this.config = { ...DEFAULT_CONFIG };
  }

  async load(): Promise<MemeConfig> {
    try {
      if (await fs.pathExists(this.configPath)) {
        const configData = await fs.readJson(this.configPath);
        this.config = { ...DEFAULT_CONFIG, ...configData };
      } else {
        // Create default config file
        await this.save();
      }
    } catch (error) {
      console.warn('Failed to load config, using defaults:', error);
    }
    return this.config;
  }

  async save(): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(this.configPath));
      await fs.writeJson(this.configPath, this.config, { spaces: 2 });
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  async update(updates: Partial<MemeConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };
    await this.save();
  }

  get(): MemeConfig {
    return { ...this.config };
  }

  getOutputDirectory(): string {
    return this.config.outputDirectory || DEFAULT_CONFIG.outputDirectory!;
  }

  getTemplatesPath(): string {
    return this.config.templatesPath || DEFAULT_CONFIG.templatesPath!;
  }

  async ensureOutputDirectory(): Promise<void> {
    const outputDir = this.getOutputDirectory();
    await fs.ensureDir(outputDir);
  }
}

// Singleton instance
let configManager: ConfigManager | null = null;

export async function getConfig(): Promise<ConfigManager> {
  if (!configManager) {
    configManager = new ConfigManager();
    await configManager.load();
  }
  return configManager;
}

export async function getConfigValue(): Promise<MemeConfig> {
  const config = await getConfig();
  return config.get();
}
