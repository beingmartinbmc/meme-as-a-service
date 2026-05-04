import { LRUCache } from 'lru-cache';
import * as crypto from 'crypto';
import { MemeOptions, MemeResult } from '../types';

const DEFAULT_MAX = Number(process.env.MEME_CACHE_SIZE || 100);
const DEFAULT_MAX_BYTES = Number(process.env.MEME_CACHE_MAX_BYTES || 64 * 1024 * 1024);

let cache: LRUCache<string, MemeResult> | null = null;

function getCache(): LRUCache<string, MemeResult> {
  if (!cache) {
    cache = new LRUCache<string, MemeResult>({
      max: DEFAULT_MAX,
      maxSize: DEFAULT_MAX_BYTES,
      sizeCalculation: (value) => value.buffer.byteLength || 1
    });
  }
  return cache;
}

export function cacheKey(options: MemeOptions): string {
  const h = crypto.createHash('sha1');
  h.update(JSON.stringify(options, Object.keys(options).sort()));
  return h.digest('hex');
}

export function getCachedRender(options: MemeOptions): MemeResult | undefined {
  return getCache().get(cacheKey(options));
}

export function setCachedRender(options: MemeOptions, result: MemeResult): void {
  getCache().set(cacheKey(options), result);
}

export function invalidateRenderCache(): void {
  getCache().clear();
}

export function renderCacheStats(): { size: number; max: number } {
  const c = getCache();
  return { size: c.size, max: c.max };
}

export function resetRenderCacheForTests(): void {
  cache = null;
}
