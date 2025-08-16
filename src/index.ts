import { MemeGenerator } from './core/meme-generator';
import { MemeOptions, MemeResult, BatchMemeOptions, BatchMemeResult } from './types';
import { getTemplate, listTemplates, searchTemplates } from './templates';

// Create a singleton instance
const memeGenerator = new MemeGenerator();

/**
 * Generate a meme with the given options
 * @param options - Meme generation options
 * @returns Promise<Buffer> - The generated meme as a buffer
 */
export async function generateMeme(options: MemeOptions): Promise<Buffer> {
  const result = await memeGenerator.generateMeme(options);
  return result.buffer;
}

/**
 * Generate a meme with full result information
 * @param options - Meme generation options
 * @returns Promise<MemeResult> - The generated meme with metadata
 */
export async function generateMemeWithMetadata(options: MemeOptions): Promise<MemeResult> {
  return await memeGenerator.generateMeme(options);
}

/**
 * Generate multiple memes in batch
 * @param options - Batch meme generation options
 * @returns Promise<BatchMemeResult> - Results of batch generation
 */
export async function generateBatchMemes(options: BatchMemeOptions): Promise<BatchMemeResult> {
  const { results, errors } = await memeGenerator.generateBatchMemes({
    templates: options.templates,
    texts: options.texts,
    globalOptions: options.options
  });

  return {
    results,
    total: options.templates.length * options.texts.length,
    successful: results.length,
    failed: errors.length,
    errors
  };
}

/**
 * Get available meme templates
 * @returns string[] - List of available template names
 */
export function getAvailableTemplates(): string[] {
  return listTemplates();
}

/**
 * Search for templates by query
 * @param query - Search query
 * @returns string[] - Matching template names
 */
export function searchAvailableTemplates(query: string): string[] {
  return searchTemplates(query);
}

/**
 * Get template information
 * @param templateName - Name of the template
 * @returns Template information or null if not found
 */
export function getTemplateInfo(templateName: string) {
  return getTemplate(templateName);
}

/**
 * Add a custom template
 * @param name - Template name
 * @param imagePath - Path to the template image
 * @param textBoxes - Text box coordinates
 * @param metadata - Optional template metadata
 */
export async function addCustomTemplate(
  name: string,
  imagePath: string,
  textBoxes: { top?: any; bottom?: any },
  metadata?: { description?: string; tags?: string[] }
): Promise<void> {
  await memeGenerator.addCustomTemplate(name, imagePath, textBoxes, metadata);
}

// Export types
export type { MemeOptions, MemeResult, BatchMemeOptions, BatchMemeResult };

// Export the generator class for advanced usage
export { MemeGenerator };

// Default export for convenience
export default {
  generateMeme,
  generateMemeWithMetadata,
  generateBatchMemes,
  getAvailableTemplates,
  searchAvailableTemplates,
  getTemplateInfo,
  addCustomTemplate
};
