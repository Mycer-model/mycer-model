// Fixed-window limiter, in memory (one process). Replace the store with Redis/Upstash when deployed on several instances.
const hits = new Map<string, { count: number; resetAt: number }>();
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): { ok: boolean; retryAfterSec: number } {
  const h = hits.get(key);
  if (!h || h.resetAt <= now) { hits.set(key, { count: 1, resetAt: now + windowMs }); return { ok: true, retryAfterSec: 0 }; }
  if (h.count >= limit) return { ok: false, retryAfterSec: Math.ceil((h.resetAt - now) / 1000) };
  h.count++; return { ok: true, retryAfterSec: 0 };
}
export function _resetRateLimit() { hits.clear(); }
