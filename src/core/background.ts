import axios from 'axios';
import * as fs from 'fs-extra';

const MAX_BG_BYTES = Number(process.env.MEME_BG_MAX_BYTES || 8 * 1024 * 1024);

const DATA_URI_RE = /^data:([^;]+);base64,(.+)$/;

/**
 * Resolve a `background` option to a Buffer suitable for handing to sharp().
 * Accepts http(s) URLs, `data:` URIs, and absolute local file paths.
 * Enforces a size cap to prevent abuse on the hosted service.
 */
export async function resolveBackground(spec: string): Promise<Buffer> {
  if (spec.startsWith('data:')) {
    const match = DATA_URI_RE.exec(spec);
    if (!match) throw new Error('Malformed data URI background');
    const buf = Buffer.from(match[2], 'base64');
    if (buf.byteLength > MAX_BG_BYTES) {
      throw new Error(`Background exceeds ${MAX_BG_BYTES} bytes`);
    }
    return buf;
  }
  if (/^https?:\/\//i.test(spec)) {
    const res = await axios.get<ArrayBuffer>(spec, {
      responseType: 'arraybuffer',
      timeout: 10_000,
      maxContentLength: MAX_BG_BYTES,
      validateStatus: (s) => s >= 200 && s < 400
    });
    const buf = Buffer.from(res.data);
    if (buf.byteLength > MAX_BG_BYTES) {
      throw new Error(`Background exceeds ${MAX_BG_BYTES} bytes`);
    }
    return buf;
  }
  if (!(await fs.pathExists(spec))) {
    throw new Error(`Background image not found: ${spec}`);
  }
  const stat = await fs.stat(spec);
  if (stat.size > MAX_BG_BYTES) {
    throw new Error(`Background exceeds ${MAX_BG_BYTES} bytes`);
  }
  return fs.readFile(spec);
}
