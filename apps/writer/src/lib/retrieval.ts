import type { Source } from './types';
const STOP = new Set('a an the of in on at to for and or but is are was were be been it its this that these those with as by from into than then so such can could may might should would will we our their they he she i you not no more most less very also which who whom how what when where while after before during over under between among about across each both many much'.split(' '));
export const tokens = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, '');
const sentences = (t: string) => t.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [t];

export interface Suggestion { text: string; sourceId: string; chunkId: string; quote: string }

// Extractive stand-in for the LLM: finds the sentence in the user's own sources that best matches what they just wrote.
// The real backend replaces this with retrieval + a model, but must keep the same shape (text + the chunk it came from).
export function suggest(context: string, sources: Source[], already: string): Suggestion | null {
  const q = new Set(tokens(context).map(stem));
  if (q.size < 3) return null;
  const df = new Map<string, number>();
  const all = sources.flatMap((s) => s.chunks.map((c) => ({ s, c })));
  for (const { c } of all) for (const w of new Set(tokens(c.text).map(stem))) df.set(w, (df.get(w) ?? 0) + 1);
  let best: { score: number; sent: string; s: Source; chunkId: string; quote: string } | null = null;
  for (const { s, c } of all) {
    for (const sent of sentences(c.text)) {
      const ws = new Set(tokens(sent).map(stem));
      let score = 0, hits = 0;
      for (const w of ws) if (q.has(w)) { hits++; score += Math.log(1 + all.length / (df.get(w) ?? 1)); }
      if (hits < 2 || already.includes(sent.slice(0, 40))) continue;
      if (!best || score > best.score) best = { score, sent, s, chunkId: c.id, quote: c.text };
    }
  }
  if (!best || best.score < 2.5) return null;
  return { text: best.sent.replace(/[.!?]+$/, '') + '.', sourceId: best.s.id, chunkId: best.chunkId, quote: best.quote };
}
