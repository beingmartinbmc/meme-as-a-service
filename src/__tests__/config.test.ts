import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { ConfigManager, getConfig, getConfigValue, resetConfigForTests } from '../config';

describe('ConfigManager', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'meme-config-'));
    resetConfigForTests();
  });

  afterEach(async () => {
    await fs.remove(tmpDir).catch(() => undefined);
    resetConfigForTests();
    delete process.env.MEME_CONFIG_PATH;
  });

  it('creates a default config file when none exists', async () => {
    const configPath = path.join(tmpDir, 'meme-config.json');
    const cm = new ConfigManager(configPath);
    await cm.load();
    expect(await fs.pathExists(configPath)).toBe(true);
    const cfg = cm.get();
    expect(cfg.defaultFontFamily).toBe('Impact');
  });

  it('loads and merges an existing config', async () => {
    const configPath = path.join(tmpDir, 'meme-config.json');
    await fs.writeJson(configPath, { defaultFontSize: 99 });
    const cm = new ConfigManager(configPath);
    const loaded = await cm.load();
    expect(loaded.defaultFontSize).toBe(99);
    expect(loaded.defaultFontFamily).toBe('Impact'); // kept from defaults
  });

  it('update() persists changes to disk', async () => {
    const configPath = path.join(tmpDir, 'meme-config.json');
    const cm = new ConfigManager(configPath);
    await cm.load();
    await cm.update({ defaultFontSize: 77 });
    const onDisk = await fs.readJson(configPath);
    expect(onDisk.defaultFontSize).toBe(77);
  });

  it('output and templates directory getters fall back to defaults', () => {
    const cm = new ConfigManager(path.join(tmpDir, 'noop.json'));
    expect(cm.getOutputDirectory()).toBe('./memes');
    expect(cm.getTemplatesPath()).toBe('./templates');
  });

  it('ensureOutputDirectory creates the dir', async () => {
    const cm = new ConfigManager(path.join(tmpDir, 'c.json'));
    await cm.update({ outputDirectory: path.join(tmpDir, 'out') });
    await cm.ensureOutputDirectory();
    expect(await fs.pathExists(path.join(tmpDir, 'out'))).toBe(true);
  });

  it('getConfig returns a singleton', async () => {
    process.env.MEME_CONFIG_PATH = path.join(tmpDir, 'singleton-c.json');
    const a = await getConfig();
    const b = await getConfig();
    expect(a).toBe(b);
  });

  it('getConfigValue returns a copy of the current config', async () => {
    process.env.MEME_CONFIG_PATH = path.join(tmpDir, 'singleton-v.json');
    const v = await getConfigValue();
    expect(v.defaultFontFamily).toBe('Impact');
  });

  it('load() survives malformed JSON by keeping defaults', async () => {
    const configPath = path.join(tmpDir, 'bad.json');
    await fs.writeFile(configPath, '{ not valid');
    const cm = new ConfigManager(configPath);
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const cfg = await cm.load();
    expect(cfg.defaultFontFamily).toBe('Impact');
    warn.mockRestore();
  });
});
