'use client';
import Link from 'next/link';
import { use, useRef, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Editor } from '@/components/editor/Editor';
import { SourceDialog } from '@/components/SourceDialog';
import { Button, Empty, Skeleton, inputCls } from '@/components/ui';
import { updateDocument, useDB } from '@/lib/store';
import { exportDocx } from '@/lib/exportDocx';
import { PLANS } from '@/lib/plans';
import { bibliography, citedIds } from '@/lib/format';
import type { CitationStyle } from '@/lib/types';

// S03 editor + side panel (S08 library tab; chat and find-papers arrive in later milestones)
export default function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const db = useDB();
  const [tab, setTab] = useState<'library' | 'chat' | 'find'>('library');
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const doc = db?.docs.find((d) => d.id === id);
  const live = useRef<any>(null); // live editor, so export never misses edits still waiting to be saved

  return (
    <AppShell wide>
      {!db ? <div className="p-8"><Skeleton className="h-40" /></div> : !doc ? (
        <div className="p-8"><Empty title="Document not found" body="It may have been archived or deleted." action={<Link className="underline" href="/documents">Back to documents</Link>} /></div>
      ) : (
        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            <div className="mx-auto mb-3 flex max-w-page flex-wrap items-center gap-2">
              <input aria-label="Document title" className={inputCls + ' min-w-[12rem] flex-1 basis-64 font-semibold'} value={doc.title} onChange={(e) => updateDocument(doc.id, { title: e.target.value })} />
              <select aria-label="Citation style" className={inputCls + ' w-auto shrink-0'} value={doc.style} onChange={(e) => updateDocument(doc.id, { style: e.target.value as CitationStyle })}>
                <option value="apa">APA 7th</option><option value="ieee">IEEE</option>
              </select>
              <Button loading={busy} onClick={async () => {
                setBusy(true); setNote('');
                const full = PLANS[db.plan].fullExport;
                const content = live.current?.getJSON() ?? doc.content;
                try { await exportDocx(doc.title || 'Untitled', content, doc.style, db.sources, full); }
                finally { setBusy(false); }
                if (!full && citedIds(content).length) setNote('Free plan: the reference list is left out of the Word file. Change plan to include it.');
              }}>Export Word</Button>
            </div>
            {note && <p role="status" className="mx-auto mb-3 max-w-page rounded-md border border-border bg-surface p-3 text-sm">{note} <Link className="underline" href="/pricing">See plans</Link></p>}
            <div className="mx-auto max-w-page"><Editor key={doc.id} doc={doc} sources={db.sources} onEditor={(e) => { live.current = e; }} /></div>
          </div>
          <aside aria-label="Side panel" className="rounded-lg border border-border bg-surface p-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-auto">
            <div role="tablist" aria-label="Panel" className="mb-3 flex gap-1">
              {(['library', 'chat', 'find'] as const).map((t) => (
                <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-md px-3 py-1 text-sm ${tab === t ? 'bg-accent text-on-accent' : 'hover:bg-border'}`}>{{ library: 'Library', chat: 'Ask AI', find: 'Find papers' }[t]}</button>
              ))}
            </div>
            {tab === 'library' && (
              <div role="tabpanel" className="flex flex-col gap-2">
                <Button size="sm" variant="primary" onClick={() => setAdding(true)}>Add source</Button>
                {db.sources.length === 0 && <Empty title="Library is empty" body="Add a PDF so suggestions can draw on it." />}
                {db.sources.map((s) => (
                  <div key={s.id} className="rounded-md border border-border bg-raised p-3 text-sm">
                    <p className="break-words font-semibold">{s.title}</p>
                    <p className="text-xs text-muted">{s.authors.map((a) => a.split(',')[0]).join(', ') || 'Unknown author'} {s.year ? `· ${s.year}` : ''} {s.sample ? '· sample' : ''}</p>
                  </div>
                ))}
              </div>
            )}
            {tab !== 'library' && (
              <div role="tabpanel"><Empty title="Not built yet" body={tab === 'chat' ? 'Chat over your library is the next milestone.' : 'Searching open paper indexes is a later milestone.'} /></div>
            )}
          </aside>
        </div>
      )}
      {adding && <SourceDialog onClose={() => setAdding(false)} />}
    </AppShell>
  );
}
