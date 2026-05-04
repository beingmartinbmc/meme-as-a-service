import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import {
  generateMeme,
  generateMemeWithMetadata,
  generateBatchMemes,
  getAvailableTemplates,
  searchAvailableTemplates,
  getTemplateInfo,
  MemeGenerator
} from '../index';

describe('library surface', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'meme-lib-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir).catch(() => undefined);
  });

  it('exports MemeGenerator class', () => {
    expect(MemeGenerator).toBeDefined();
    expect(new MemeGenerator()).toBeInstanceOf(MemeGenerator);
  });

  it('generateMeme returns a Buffer', async () => {
    const buf = await generateMeme({ template: 'drake', topText: 'a', bottomText: 'b' });
    expect(Buffer.isBuffer(buf)).toBe(true);
  });

  it('generateMemeWithMetadata returns full result', async () => {
    const r = await generateMemeWithMetadata({ template: 'drake', topText: 'a' });
    expect(r.template).toBe('drake');
    expect(r.format).toBe('png');
    expect(r.width).toBeGreaterThan(0);
  });

  it('generateBatchMemes aggregates successes and failures', async () => {
    const r = await generateBatchMemes({
      templates: ['drake', 'nope-template'],
      texts: [{ topText: 'x' }, { topText: 'y' }]
    });
    expect(r.total).toBe(4);
    expect(r.successful).toBe(2);
    expect(r.failed).toBe(2);
  });

  it('getAvailableTemplates includes built-ins', () => {
    expect(getAvailableTemplates()).toEqual(expect.arrayContaining(['drake', 'doge']));
  });

  it('searchAvailableTemplates filters by query', () => {
    expect(searchAvailableTemplates('drake')).toContain('drake');
  });

  it('getTemplateInfo returns metadata or null', () => {
    expect(getTemplateInfo('drake')?.name).toBe('Drake Hotline Bling');
    expect(getTemplateInfo('nope')).toBeNull();
  });

  it('addCustomTemplate can be called through a MemeGenerator with tmp dir', async () => {
    const seed = path.join(tmpDir, 'seed.png');
    await fs.writeFile(seed, Buffer.from('fake'));
    const g = new MemeGenerator(tmpDir);
    await expect(
      g.addCustomTemplate('facade-ok', seed, {
        top: { x: 0, y: 0, width: 10, height: 10 }
      })
    ).resolves.toBeUndefined();
  });
});
