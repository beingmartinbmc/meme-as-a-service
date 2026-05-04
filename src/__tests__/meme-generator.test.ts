import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { MemeGenerator } from '../core/meme-generator';
import { MemeOptions } from '../types';
import { setTemplatesDirectory } from '../templates';
import { resetRenderCacheForTests } from '../core/render-cache';
import { resetConfigForTests } from '../config';

describe('MemeGenerator', () => {
  let generator: MemeGenerator;
  let tmpDir: string;
  let origConfigPath: string | undefined;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'meme-gen-'));
    origConfigPath = process.env.MEME_CONFIG_PATH;
    process.env.MEME_CONFIG_PATH = path.join(tmpDir, 'meme-config.json');
    resetConfigForTests();
    setTemplatesDirectory(tmpDir);
    resetRenderCacheForTests();
    // Seed a fake template image so the "exists" check passes.
    for (const f of [
      'drake.png',
      'doge.png',
      'distracted-boyfriend.png',
      'two-buttons.png',
      'change-my-mind.png',
      'one-does-not-simply.png'
    ]) {
      await fs.writeFile(path.join(tmpDir, f), Buffer.from('fake'));
    }
    generator = new MemeGenerator(tmpDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir).catch(() => undefined);
    if (origConfigPath === undefined) delete process.env.MEME_CONFIG_PATH;
    else process.env.MEME_CONFIG_PATH = origConfigPath;
  });

  describe('generateMeme', () => {
    it('generates a meme with valid options', async () => {
      const result = await generator.generateMeme({
        template: 'drake',
        topText: 'Test top text',
        bottomText: 'Test bottom text'
      });
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.format).toBe('png');
      expect(result.template).toBe('drake');
    });

    it('throws for invalid template', async () => {
      await expect(
        generator.generateMeme({ template: 'invalid-template', topText: 'x' })
      ).rejects.toThrow("Template 'invalid-template' not found");
    });

    it('throws if template image is missing on disk', async () => {
      await fs.remove(path.join(tmpDir, 'drake.png'));
      resetRenderCacheForTests();
      await expect(
        generator.generateMeme({ template: 'drake', topText: 'x' })
      ).rejects.toThrow(/Template image not found/);
    });

    it('honors jpeg format', async () => {
      const r = await generator.generateMeme({
        template: 'drake',
        topText: 'x',
        format: 'jpeg',
        quality: 80
      });
      expect(r.format).toBe('jpeg');
    });

    it('honors webp and avif formats', async () => {
      const webp = await generator.generateMeme({
        template: 'drake',
        topText: 'a',
        format: 'webp'
      });
      expect(webp.format).toBe('webp');
      const avif = await generator.generateMeme({
        template: 'doge',
        topText: 'a',
        format: 'avif'
      });
      expect(avif.format).toBe('avif');
    });

    it('unknown format falls back to png', async () => {
      const r = await generator.generateMeme({
        template: 'drake',
        topText: 'x',
        format: 'gif' as unknown as MemeOptions['format']
      });
      expect(r.format).toBe('png');
    });

    it('returns cached result on second identical call', async () => {
      const opts: MemeOptions = { template: 'drake', topText: 'cached!' };
      const first = await generator.generateMeme(opts);
      const second = await generator.generateMeme(opts);
      expect(second).toBe(first);
    });

    it('handles empty top/bottom text', async () => {
      const r = await generator.generateMeme({ template: 'drake', topText: '', bottomText: '' });
      expect(r.buffer).toBeInstanceOf(Buffer);
    });

    it('honors custom styling', async () => {
      const r = await generator.generateMeme({
        template: 'drake',
        topText: 'Custom',
        fontSize: 50,
        fontFamily: 'Arial',
        textColor: '#ff0000',
        strokeColor: '#000000',
        strokeWidth: 3
      });
      expect(r.buffer).toBeInstanceOf(Buffer);
    });
  });

  describe('generateMemeAndSave', () => {
    it('writes meme to disk and returns the path', async () => {
      const outDir = path.join(tmpDir, 'out');
      process.env.MEME_OUTPUT_DIR = outDir;
      const { result, filePath } = await generator.generateMemeAndSave({
        template: 'drake',
        topText: 'hi'
      });
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(filePath).toMatch(/drake-\d+-[0-9a-f]+\.png$/);
      delete process.env.MEME_OUTPUT_DIR;
    });

    it('honors caller-supplied filename', async () => {
      const { filePath } = await generator.generateMemeAndSave(
        { template: 'drake', topText: 'hi' },
        'custom-name.png'
      );
      expect(filePath.endsWith('custom-name.png')).toBe(true);
    });
  });

  describe('generateBatchMemes', () => {
    it('generates multiple memes across templates and texts', async () => {
      const r = await generator.generateBatchMemes({
        templates: ['drake', 'doge'],
        texts: [
          { topText: 'A', bottomText: 'B' },
          { topText: 'C', bottomText: 'D' }
        ],
        globalOptions: { fontSize: 40 }
      });
      expect(r.results).toHaveLength(4);
      expect(r.errors).toHaveLength(0);
    });

    it('captures errors per template', async () => {
      const r = await generator.generateBatchMemes({
        templates: ['drake', 'invalid-template'],
        texts: [{ topText: 'x' }]
      });
      expect(r.results).toHaveLength(1);
      expect(r.errors).toHaveLength(1);
      expect(r.errors[0].template).toBe('invalid-template');
    });
  });

  describe('generateBatchMemesAndSave', () => {
    it('writes every meme to disk with unique names', async () => {
      const outDir = path.join(tmpDir, 'batch-out');
      const r = await generator.generateBatchMemesAndSave({
        templates: ['drake', 'doge'],
        texts: [{ topText: 'a' }, { topText: 'b' }],
        outputDirectory: outDir
      });
      expect(r.results).toHaveLength(4);
      const filenames = r.results.map((x) => path.basename(x.filePath));
      expect(new Set(filenames).size).toBe(filenames.length);
    });

    it('captures per-template errors', async () => {
      const outDir = path.join(tmpDir, 'batch-out-err');
      const r = await generator.generateBatchMemesAndSave({
        templates: ['invalid-template'],
        texts: [{ topText: 'x' }],
        outputDirectory: outDir
      });
      expect(r.errors).toHaveLength(1);
    });
  });

  describe('addCustomTemplate', () => {
    it('copies image, writes JSON, and makes the template usable', async () => {
      const seed = path.join(tmpDir, 'seed.png');
      await fs.writeFile(seed, Buffer.from('fake'));

      await generator.addCustomTemplate(
        'custom-add',
        seed,
        { top: { x: 0, y: 0, width: 10, height: 10 } },
        { description: 'desc', tags: ['a'] }
      );

      // File should exist in custom/ subdir
      expect(await fs.pathExists(path.join(tmpDir, 'custom', 'custom-add.png'))).toBe(true);
      // Registry should pick it up
      expect(generator.getAvailableTemplates()).toContain('custom-add');
    });

    it('throws if source image does not exist', async () => {
      await expect(
        generator.addCustomTemplate('x', path.join(tmpDir, 'nope.png'), {})
      ).rejects.toThrow(/Image file not found/);
    });
  });

  describe('getAvailableTemplates', () => {
    it('returns list containing built-ins', () => {
      const names = generator.getAvailableTemplates();
      expect(names).toEqual(expect.arrayContaining(['drake', 'doge', 'distracted-boyfriend']));
    });
  });

  describe('lines[] option', () => {
    it('uses lines instead of top/bottom when supplied', async () => {
      const r = await generator.generateMeme({
        template: 'drake',
        lines: ['first line', 'second line']
      });
      expect(r.buffer).toBeInstanceOf(Buffer);
    });

    it('accepts empty strings in lines without crashing', async () => {
      const r = await generator.generateMeme({
        template: 'drake',
        lines: ['', 'only bottom']
      });
      expect(r.buffer).toBeInstanceOf(Buffer);
    });

    it('accepts more lines than template boxes (extras ignored)', async () => {
      const r = await generator.generateMeme({
        template: 'drake',
        lines: ['a', 'b', 'c', 'd']
      });
      expect(r.buffer).toBeInstanceOf(Buffer);
    });
  });

  describe('per-line colors', () => {
    it('accepts an array of text colors', async () => {
      const r = await generator.generateMeme({
        template: 'drake',
        lines: ['red', 'blue'],
        textColor: ['#ff0000', '#0000ff']
      });
      expect(r.buffer).toBeInstanceOf(Buffer);
    });

    it('cycles colors when fewer than lines', async () => {
      const r = await generator.generateMeme({
        template: 'drake',
        lines: ['one', 'two'],
        textColor: ['#ff0000'],
        strokeColor: ['#000000']
      });
      expect(r.buffer).toBeInstanceOf(Buffer);
    });
  });

  describe('background overlay', () => {
    it('accepts a local file path as background', async () => {
      const bg = path.join(tmpDir, 'bg.png');
      await fs.writeFile(bg, Buffer.from('bg-bytes'));
      const r = await generator.generateMeme({
        template: 'drake',
        topText: 'over',
        bottomText: 'custom bg',
        background: bg
      });
      expect(r.buffer).toBeInstanceOf(Buffer);
    });

    it('still renders when template image is absent, as long as background is set', async () => {
      await fs.remove(path.join(tmpDir, 'drake.png'));
      resetRenderCacheForTests();
      const bg = path.join(tmpDir, 'bg.png');
      await fs.writeFile(bg, Buffer.from('bg-bytes'));
      const r = await generator.generateMeme({
        template: 'drake',
        topText: 'hi',
        background: bg
      });
      expect(r.buffer).toBeInstanceOf(Buffer);
    });
  });
});
