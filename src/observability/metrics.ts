import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

export const registry = new Registry();

// Only attach default metrics once, even when the module is re-imported.
// Use a property on the registry to dedupe without leaking globals.
const REGISTERED = Symbol.for('meme-as-a-service.default-metrics-registered');
if (!(registry as unknown as Record<symbol, boolean>)[REGISTERED]) {
  collectDefaultMetrics({ register: registry, prefix: 'meme_' });
  (registry as unknown as Record<symbol, boolean>)[REGISTERED] = true;
}

export const memesRenderedTotal = new Counter({
  name: 'meme_renders_total',
  help: 'Total meme renders',
  labelNames: ['template', 'cached'] as const,
  registers: [registry]
});

export const memeRenderDurationSeconds = new Histogram({
  name: 'meme_render_duration_seconds',
  help: 'Duration of meme render in seconds',
  labelNames: ['template'] as const,
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [registry]
});

export const httpRequestsTotal = new Counter({
  name: 'meme_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'] as const,
  registers: [registry]
});

export async function metricsText(): Promise<string> {
  return registry.metrics();
}

export function resetMetricsForTests(): void {
  memesRenderedTotal.reset();
  memeRenderDurationSeconds.reset();
  httpRequestsTotal.reset();
}
