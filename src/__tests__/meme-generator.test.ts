import { MemeGenerator } from '../core/meme-generator';
import { MemeOptions } from '../types';

describe('MemeGenerator', () => {
  let generator: MemeGenerator;

  beforeEach(() => {
    generator = new MemeGenerator();
  });

  describe('generateMeme', () => {
    it('should generate a meme with valid options', async () => {
      const options: MemeOptions = {
        template: 'drake',
        topText: 'Test top text',
        bottomText: 'Test bottom text',
      };

      const result = await generator.generateMeme(options);

      expect(result).toBeDefined();
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.format).toBe('png');
      expect(result.template).toBe('drake');
      expect(result.options).toEqual(options);
    });

    it('should throw error for invalid template', async () => {
      const options: MemeOptions = {
        template: 'invalid-template',
        topText: 'Test',
      };

      await expect(generator.generateMeme(options)).rejects.toThrow(
        "Template 'invalid-template' not found"
      );
    });

    it('should handle empty text', async () => {
      const options: MemeOptions = {
        template: 'drake',
        topText: '',
        bottomText: '',
      };

      const result = await generator.generateMeme(options);

      expect(result).toBeDefined();
      expect(result.buffer).toBeInstanceOf(Buffer);
    });

    it('should handle custom styling options', async () => {
      const options: MemeOptions = {
        template: 'drake',
        topText: 'Custom styled',
        bottomText: 'Meme',
        fontSize: 50,
        textColor: '#FF0000',
        strokeColor: '#000000',
        strokeWidth: 3,
      };

      const result = await generator.generateMeme(options);

      expect(result).toBeDefined();
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.options).toEqual(options);
    });
  });

  describe('generateBatchMemes', () => {
    it('should generate multiple memes', async () => {
      const batchOptions = {
        templates: ['drake', 'doge'],
        texts: [
          { topText: 'Text 1', bottomText: 'Bottom 1' },
          { topText: 'Text 2', bottomText: 'Bottom 2' },
        ],
        globalOptions: {
          fontSize: 40,
          textColor: '#FFFFFF',
        },
      };

      const result = await generator.generateBatchMemes(batchOptions);

      expect(result.results).toHaveLength(4); // 2 templates × 2 texts
      expect(result.errors).toHaveLength(0);
      expect(result.results[0].buffer).toBeInstanceOf(Buffer);
    });

    it('should handle errors in batch generation', async () => {
      const batchOptions = {
        templates: ['drake', 'invalid-template'],
        texts: [{ topText: 'Test' }],
      };

      const result = await generator.generateBatchMemes(batchOptions);

      expect(result.results).toHaveLength(1); // Only drake template works
      expect(result.errors).toHaveLength(1); // invalid-template fails
      expect(result.errors[0].template).toBe('invalid-template');
    });
  });

  describe('getAvailableTemplates', () => {
    it('should return list of available templates', () => {
      const templates = generator.getAvailableTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates).toContain('drake');
      expect(templates).toContain('doge');
      expect(templates).toContain('distracted-boyfriend');
    });
  });
});
