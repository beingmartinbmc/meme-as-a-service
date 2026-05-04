import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import {
  getTemplate,
  listTemplates,
  searchTemplates,
  getAllTemplates,
  setTemplatesDirectory,
  invalidateCustomTemplatesCache,
  getTemplatesDirectory,
  BUILTIN_MEME_TEMPLATES,
  MEME_TEMPLATES
} from '../templates';

describe('templates registry', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'meme-templates-'));
    setTemplatesDirectory(tmpDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir).catch(() => undefined);
  });

  it('backwards-compat MEME_TEMPLATES alias points at built-ins', () => {
    expect(MEME_TEMPLATES).toBe(BUILTIN_MEME_TEMPLATES);
  });

  it('listTemplates includes all built-ins', () => {
    const names = listTemplates();
    expect(names).toEqual(
      expect.arrayContaining(['drake', 'doge', 'distracted-boyfriend', 'two-buttons'])
    );
  });

  it('getTemplate supports case-insensitive lookup', () => {
    expect(getTemplate('DRAKE')?.name).toBe('Drake Hotline Bling');
    expect(getTemplate('Drake')?.name).toBe('Drake Hotline Bling');
  });

  it('getTemplate returns null for unknown', () => {
    expect(getTemplate('nope-nope')).toBeNull();
  });

  it('searchTemplates matches name, description, and tags', () => {
    expect(searchTemplates('drake')).toContain('drake');
    expect(searchTemplates('hotline')).toContain('drake');
    expect(searchTemplates('approval')).toContain('drake');
    expect(searchTemplates('doge')).toContain('doge');
  });

  it('searchTemplates matches keywords', () => {
    expect(searchTemplates('mordor')).toContain('one-does-not-simply');
    expect(searchTemplates('such')).toContain('doge');
    expect(searchTemplates('versus')).toContain('drake');
  });

  it('searchTemplates returns empty array for no matches', () => {
    expect(searchTemplates('zzzzzz-none')).toEqual([]);
  });

  it('searchTemplates returns empty array for empty/whitespace input', () => {
    expect(searchTemplates('')).toEqual([]);
    expect(searchTemplates('   ')).toEqual([]);
  });

  it('searchTemplates ranks exact id matches first', () => {
    // "drake" is a template id, and also appears in tags of itself; the
    // exact-id match should place it first.
    const hits = searchTemplates('drake');
    expect(hits[0]).toBe('drake');
  });

  it('loads custom-templates.json from disk', async () => {
    await fs.writeJson(path.join(tmpDir, 'custom-templates.json'), {
      'custom-one': {
        name: 'Custom One',
        imagePath: 'custom-one.png',
        width: 100,
        height: 100,
        textBoxes: {}
      }
    });
    invalidateCustomTemplatesCache();
    const all = getAllTemplates();
    expect(all['custom-one']).toBeDefined();
    expect(listTemplates()).toContain('custom-one');
  });

  it('custom templates override built-ins with the same name', async () => {
    await fs.writeJson(path.join(tmpDir, 'custom-templates.json'), {
      drake: {
        name: 'Overridden',
        imagePath: 'x.png',
        width: 10,
        height: 10,
        textBoxes: {}
      }
    });
    invalidateCustomTemplatesCache();
    expect(getTemplate('drake')?.name).toBe('Overridden');
  });

  it('getAllTemplates is cached based on mtime', async () => {
    const file = path.join(tmpDir, 'custom-templates.json');
    await fs.writeJson(file, { a: { name: 'A', imagePath: 'a.png', width: 1, height: 1, textBoxes: {} } });
    invalidateCustomTemplatesCache();
    expect(Object.keys(getAllTemplates())).toContain('a');

    // Second read without invalidation should still see 'a' (uses cache).
    expect(Object.keys(getAllTemplates())).toContain('a');
  });

  it('falls back to empty custom map when file is missing', () => {
    invalidateCustomTemplatesCache();
    expect(Object.keys(getAllTemplates()).length).toBeGreaterThan(0);
  });

  it('getTemplatesDirectory returns the currently configured path', () => {
    expect(getTemplatesDirectory()).toBe(tmpDir);
  });
});
