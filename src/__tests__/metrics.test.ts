import {
  registry,
  memesRenderedTotal,
  memeRenderDurationSeconds,
  httpRequestsTotal,
  metricsText,
  resetMetricsForTests
} from '../observability/metrics';

describe('metrics', () => {
  beforeEach(() => {
    resetMetricsForTests();
  });

  it('registry includes all custom metrics', async () => {
    const names = (await registry.getMetricsAsJSON()).map((m) => m.name);
    expect(names).toContain('meme_renders_total');
    expect(names).toContain('meme_render_duration_seconds');
    expect(names).toContain('meme_http_requests_total');
  });

  it('incrementing counter shows up in text output', async () => {
    memesRenderedTotal.inc({ template: 'drake', cached: 'false' });
    httpRequestsTotal.inc({ method: 'GET', route: '/x', status: '200' });
    const txt = await metricsText();
    expect(txt).toContain('meme_renders_total');
    expect(txt).toContain('meme_http_requests_total');
  });

  it('histogram records durations', async () => {
    const end = memeRenderDurationSeconds.startTimer({ template: 'doge' });
    end();
    const txt = await metricsText();
    expect(txt).toContain('meme_render_duration_seconds');
  });
});
