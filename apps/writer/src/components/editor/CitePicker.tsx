'use client';
import { useEffect, useRef, useState } from 'react';
import type { Source } from '@/lib/types';
import { Dialog, inputCls } from '../ui';

export function CitePicker({ sources, onPick, onClose }: { sources: Source[]; onPick: (s: Source) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const list = sources.filter((s) => (s.title + s.authors.join(' ') + (s.year ?? '')).toLowerCase().includes(q.toLowerCase()));
  return (
    <Dialog title="Cite a source" onClose={onClose}>
      <input ref={ref} className={inputCls} placeholder="Search your library" aria-label="Search your library" value={q} onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && list[0]) onPick(list[0]); }} />
      <ul className="mt-3 flex flex-col gap-1">
        {list.length === 0 && <li className="p-3 text-sm text-muted">{sources.length ? 'No source matches that search.' : 'Your library is empty. Add a source first.'}</li>}
        {list.map((s) => (
          <li key={s.id}>
            <button className="w-full rounded-md p-3 text-left hover:bg-surface" onClick={() => onPick(s)}>
              <span className="block break-words text-sm font-semibold">{s.title}</span>
              <span className="block text-xs text-muted">{s.authors.map((a) => a.split(',')[0]).join(', ') || 'Unknown author'} {s.year ? `· ${s.year}` : ''}</span>
            </button>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
