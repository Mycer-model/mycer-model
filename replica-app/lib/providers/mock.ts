import type { Provider, ProviderRequest, ProviderStatus } from './types';
// Fake provider: finishes after 4 seconds and returns a generated SVG poster. No network.
// Kept on globalThis: route handlers and pages can load separate copies of this module.
const g = globalThis as unknown as { __mockTasks?: Map<string, { req: ProviderRequest; startedAt: number }> };
const tasks = (g.__mockTasks ??= new Map<string, { req: ProviderRequest; startedAt: number }>());
const RUN_MS = 4000;
const hue = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);
function poster(req: ProviderRequest): string {
  const [w, h] = req.ratio.split(':').map(Number);
  const W = 640, H = Math.round((640 * h) / w);
  const h1 = hue(req.prompt), h2 = (h1 + 60) % 360;
  const safe = req.prompt.slice(0, 60).replace(/[<>&"]/g, ' ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h1} 70% 45%)"/><stop offset="1" stop-color="hsl(${h2} 70% 30%)"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="24" y="${H - 28}" fill="white" font-family="sans-serif" font-size="18">${safe}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
export const mockProvider: Provider = {
  name: 'mock',
  async start(req) {
    const taskId = crypto.randomUUID();
    tasks.set(taskId, { req, startedAt: Date.now() });
    return { taskId };
  },
  async poll(taskId): Promise<ProviderStatus> {
    const t = tasks.get(taskId);
    if (!t) return { status: 'failed', failure: 'Unknown task.' };
    if (/\bfail\b/i.test(t.req.prompt)) return { status: 'failed', failure: 'The test prompt asked for a failure.' };
    if (Date.now() - t.startedAt < RUN_MS) return { status: 'running' };
    return { status: 'succeeded', outputUrl: poster(t.req) };
  },
};
