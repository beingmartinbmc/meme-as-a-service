import {
  cacheKey,
  getCachedRender,
  setCachedRender,
  invalidateRenderCache,
  renderCacheStats,
  resetRenderCacheForTests
} from '../core/render-cache';
import { MemeOptions, MemeResult } from '../types';

function makeResult(size = 128): MemeResult {
  return {
    buffer: Buffer.alloc(size, 0),
    format: 'png',
    width: 800,
    height: 600,
    template: 'drake',
    options: { template: 'drake', topText: 'hi' }
  };
}

describe('render-cache', () => {
  beforeEach(() => {
    resetRenderCacheForTests();
  });

  it('returns undefined for unseen options', () => {
    expect(getCachedRender({ template: 'drake' })).toBeUndefined();
  });

  it('round-trips a cached render', () => {
    const opts: MemeOptions = { template: 'drake', topText: 'x' };
    const r = makeResult();
    setCachedRender(opts, r);
    expect(getCachedRender(opts)).toBe(r);
  });

  it('produces the same key for semantically equal options', () => {
    const a = cacheKey({ template: 'drake', topText: 'x', bottomText: 'y' });
    const b = cacheKey({ bottomText: 'y', template: 'drake', topText: 'x' });
    expect(a).toBe(b);
  });

  it('invalidate clears entries', () => {
    const opts: MemeOptions = { template: 'drake', topText: 'x' };
    setCachedRender(opts, makeResult());
    invalidateRenderCache();
    expect(getCachedRender(opts)).toBeUndefined();
  });

  it('exposes size stats', () => {
    setCachedRender({ template: 'doge', topText: 'a' }, makeResult());
    const stats = renderCacheStats();
    expect(stats.size).toBeGreaterThan(0);
    expect(stats.max).toBeGreaterThan(0);
  });
});
