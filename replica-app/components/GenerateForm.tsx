'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MODELS, getModel, costOf } from '@/lib/models';
export function GenerateForm({ credits }: { credits: number }) {
  const router = useRouter();
  const [modelId, setModelId] = useState(MODELS[0].id);
  const model = getModel(modelId)!;
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState(model.ratios[0]);
  const [duration, setDuration] = useState<number | undefined>(model.durations?.[0]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const cost = costOf(model, duration);
  function pickModel(id: string) {
    const m = getModel(id)!; setModelId(id); setRatio(m.ratios[0]); setDuration(m.durations?.[0]);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(null);
    const res = await fetch('/api/generations', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model: modelId, prompt, ratio, duration }) });
    const body = await res.json();
    setBusy(false);
    if (!res.ok) return setError(body.error);
    router.push(`/assets/${body.id}`); router.refresh();
  }
  const field = 'w-full rounded-md border border-input bg-raised px-3 py-2 text-base focus-visible:outline-none';
  return (
    <form onSubmit={submit} className="space-y-5" aria-busy={busy}>
      <div>
        <label htmlFor="model" className="mb-1 block text-sm font-medium">Model</label>
        <select id="model" value={modelId} onChange={(e) => pickModel(e.target.value)} className={field}>
          {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label} · {m.unit === 'second' ? `${m.creditsPerUnit} credits per second` : `${m.creditsPerUnit} credits`}</option>)}
        </select>
        <p className="mt-1 text-xs text-muted">{model.blurb}</p>
      </div>
      <div>
        <label htmlFor="prompt" className="mb-1 block text-sm font-medium">Prompt</label>
        <textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} maxLength={model.maxPrompt + 200} className={field} aria-describedby="count" />
        <p id="count" className={`mt-1 text-xs ${prompt.length > model.maxPrompt ? 'text-danger' : 'text-muted'}`}>{prompt.length} / {model.maxPrompt}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label htmlFor="ratio" className="mb-1 block text-sm font-medium">Shape</label>
          <select id="ratio" value={ratio} onChange={(e) => setRatio(e.target.value)} className={field}>{model.ratios.map((r) => <option key={r}>{r}</option>)}</select></div>
        {model.durations && <div><label htmlFor="duration" className="mb-1 block text-sm font-medium">Length (seconds)</label>
          <select id="duration" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={field}>{model.durations.map((d) => <option key={d}>{d}</option>)}</select></div>}
      </div>
      {error && <p role="alert" className="rounded-md border border-danger p-3 text-sm text-danger">{error}</p>}
      <div className="flex items-center justify-between gap-3">
        <p className={`text-sm ${cost > credits ? 'text-danger' : 'text-muted'}`}>This will use {cost} of your {credits} credits.</p>
        <button type="submit" disabled={busy || !prompt.trim() || cost > credits} className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:bg-disabled-bg disabled:text-disabled-text">{busy ? 'Starting…' : 'Create'}</button>
      </div>
    </form>
  );
}
