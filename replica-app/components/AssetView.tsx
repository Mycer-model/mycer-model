'use client';
import { useEffect, useState } from 'react';
import type { Generation } from '@/lib/data';
export function AssetView({ initial }: { initial: Generation }) {
  const [g, setG] = useState(initial);
  useEffect(() => {
    if (g.status !== 'running') return;
    const t = setInterval(async () => { const r = await fetch(`/api/generations/${g.id}`); if (r.ok) setG(await r.json()); }, 1000);
    return () => clearInterval(t);
  }, [g.id, g.status]);
  async function cancel() { const r = await fetch(`/api/generations/${g.id}`, { method: 'DELETE' }); if (r.ok) setG(await r.json()); }
  return (
    <div className="space-y-4">
      <div className="flex min-h-48 items-center justify-center overflow-hidden rounded-lg bg-media text-on-media">
        {g.status === 'succeeded' && g.outputUrl && <img src={g.outputUrl} alt={g.prompt} className="max-h-[70vh] w-full object-contain" />}
        {g.status === 'running' && <p role="status" className="p-8">Working on it… this usually takes a few seconds.</p>}
        {g.status === 'failed' && <p role="alert" className="p-8">That did not work: {g.failure} Your credits were returned.</p>}
        {g.status === 'cancelled' && <p role="status" className="p-8">Stopped. Your credits were returned.</p>}
      </div>
      <p className="text-sm [overflow-wrap:anywhere]">{g.prompt}</p>
      <p className="text-xs text-muted">{g.kind} · {g.ratio}{g.duration ? ` · ${g.duration}s` : ''} · {g.cost} credits</p>
      <div className="flex gap-3">
        {g.status === 'running' && <button onClick={cancel} className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-surface">Stop</button>}
        {g.status === 'succeeded' && g.outputUrl && <a href={g.outputUrl} download={`creation-${g.id}.svg`} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent hover:bg-accent-hover">Download</a>}
      </div>
    </div>
  );
}
