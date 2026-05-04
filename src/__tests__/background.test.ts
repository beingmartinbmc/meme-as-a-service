import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import axios from 'axios';
import { resolveBackground } from '../core/background';

jest.mock('axios');
const mockedAxios = axios as unknown as jest.Mocked<typeof axios>;

describe('resolveBackground', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'meme-bg-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir).catch(() => undefined);
    jest.clearAllMocks();
  });

  it('decodes a data URI', async () => {
    const b64 = Buffer.from('hello').toString('base64');
    const buf = await resolveBackground(`data:image/png;base64,${b64}`);
    expect(buf.toString()).toBe('hello');
  });

  it('rejects a malformed data URI', async () => {
    await expect(resolveBackground('data:image/png;xxx')).rejects.toThrow(/Malformed/);
  });

  it('fetches an http URL', async () => {
    const payload = Buffer.from('remote-bytes');
    mockedAxios.get.mockResolvedValue({ data: payload } as never);
    const buf = await resolveBackground('https://example.test/x.png');
    expect(buf.toString()).toBe('remote-bytes');
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://example.test/x.png',
      expect.objectContaining({ responseType: 'arraybuffer' })
    );
  });

  it('loads a local file', async () => {
    const p = path.join(tmpDir, 'local.png');
    await fs.writeFile(p, Buffer.from('local-bytes'));
    const buf = await resolveBackground(p);
    expect(buf.toString()).toBe('local-bytes');
  });

  it('throws when local file is missing', async () => {
    await expect(resolveBackground(path.join(tmpDir, 'nope.png'))).rejects.toThrow(/not found/);
  });

  it('rejects oversized local file', async () => {
    const origCap = process.env.MEME_BG_MAX_BYTES;
    process.env.MEME_BG_MAX_BYTES = '10';
    const p = path.join(tmpDir, 'big.png');
    await fs.writeFile(p, Buffer.alloc(100, 1));
    // Re-import to pick up the new cap.
    jest.resetModules();
    const { resolveBackground: rb } = await import('../core/background');
    await expect(rb(p)).rejects.toThrow(/exceeds/);
    if (origCap === undefined) delete process.env.MEME_BG_MAX_BYTES;
    else process.env.MEME_BG_MAX_BYTES = origCap;
  });

  it('rejects oversized data URI', async () => {
    const origCap = process.env.MEME_BG_MAX_BYTES;
    process.env.MEME_BG_MAX_BYTES = '5';
    jest.resetModules();
    const { resolveBackground: rb } = await import('../core/background');
    const b64 = Buffer.alloc(100, 0).toString('base64');
    await expect(rb(`data:image/png;base64,${b64}`)).rejects.toThrow(/exceeds/);
    if (origCap === undefined) delete process.env.MEME_BG_MAX_BYTES;
    else process.env.MEME_BG_MAX_BYTES = origCap;
  });
});
