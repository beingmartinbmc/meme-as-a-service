import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import axios from 'axios';
import { DynamicTemplateLoader } from '../templates/dynamic-loader';
import { setTemplatesDirectory } from '../templates';

jest.mock('axios');
const mockedAxios = axios as unknown as jest.MockedFunction<typeof axios>;

describe('DynamicTemplateLoader', () => {
  let tmpDir: string;
  let loader: DynamicTemplateLoader;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'meme-loader-'));
    setTemplatesDirectory(tmpDir);
    loader = new DynamicTemplateLoader(tmpDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir).catch(() => undefined);
    jest.clearAllMocks();
  });

  it('loadCustomTemplates returns {} when no file exists', async () => {
    expect(await loader.loadCustomTemplates()).toEqual({});
  });

  it('addTemplateFromUrl writes image + json and rejects bad names', async () => {
    await expect(
      loader.addTemplateFromUrl({ name: '../../evil', url: 'http://x' })
    ).resolves.toBe(false);

    mockedAxios.mockResolvedValue({ data: Buffer.from('png-data') } as unknown as never);
    const ok = await loader.addTemplateFromUrl({
      name: 'from-url-ok',
      url: 'http://example.test/a.png'
    });
    expect(ok).toBe(true);
    const all = await loader.loadCustomTemplates();
    expect(all['from-url-ok']).toBeDefined();
    expect(await fs.pathExists(path.join(tmpDir, 'from-url-ok.png'))).toBe(true);
  });

  it('addTemplateFromUrl returns false on network error', async () => {
    mockedAxios.mockRejectedValue(new Error('ETIMEDOUT'));
    const ok = await loader.addTemplateFromUrl({ name: 'net-err', url: 'http://nope' });
    expect(ok).toBe(false);
  });

  it('addTemplateFromFile copies to templates dir and writes metadata', async () => {
    const srcPng = path.join(tmpDir, 'input.png');
    await fs.writeFile(srcPng, Buffer.from('fake'));

    const ok = await loader.addTemplateFromFile(
      'from-file-ok',
      srcPng,
      { top: { x: 0, y: 0, width: 10, height: 10 } },
      { description: 'desc', tags: ['a', 'b'] }
    );
    expect(ok).toBe(true);
    const all = await loader.loadCustomTemplates();
    expect(all['from-file-ok'].description).toBe('desc');
    expect(all['from-file-ok'].tags).toEqual(['a', 'b']);
  });

  it('addTemplateFromFile rejects traversal names', async () => {
    const srcPng = path.join(tmpDir, 'input.png');
    await fs.writeFile(srcPng, Buffer.from('fake'));
    const ok = await loader.addTemplateFromFile('../../sneaky', srcPng, {});
    expect(ok).toBe(false);
  });

  it('removeTemplate deletes both image and metadata', async () => {
    const srcPng = path.join(tmpDir, 'seed.png');
    await fs.writeFile(srcPng, Buffer.from('fake'));
    await loader.addTemplateFromFile('remove-me', srcPng, {});

    const removed = await loader.removeTemplate('remove-me');
    expect(removed).toBe(true);
    const all = await loader.loadCustomTemplates();
    expect(all['remove-me']).toBeUndefined();
    expect(await fs.pathExists(path.join(tmpDir, 'remove-me.png'))).toBe(false);
  });

  it('removeTemplate returns false if not present', async () => {
    expect(await loader.removeTemplate('never-existed')).toBe(false);
  });

  it('removeTemplate rejects traversal names', async () => {
    expect(await loader.removeTemplate('../../bad')).toBe(false);
  });

  it('listCustomTemplates reflects current state', async () => {
    const srcPng = path.join(tmpDir, 'seed.png');
    await fs.writeFile(srcPng, Buffer.from('fake'));
    await loader.addTemplateFromFile('one', srcPng, {});
    await loader.addTemplateFromFile('two', srcPng, {});

    const list = await loader.listCustomTemplates();
    expect(list.sort()).toEqual(['one', 'two']);
  });

  it('loadCustomTemplates surfaces corrupt JSON as empty', async () => {
    await fs.writeFile(path.join(tmpDir, 'custom-templates.json'), '{ not json');
    expect(await loader.loadCustomTemplates()).toEqual({});
  });
});
