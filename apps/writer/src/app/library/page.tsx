'use client';
import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { SourceDialog } from '@/components/SourceDialog';
import { Button, Empty, Skeleton } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { addSource, deleteSource, useDB } from '@/lib/store';

// S08 library (collections, filters and duplicate detection come later)
export default function Library() {
  const db = useDB();
  const [adding, setAdding] = useState(false);
  const toast = useToast();
  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Library</h1>
        <Button variant="primary" onClick={() => setAdding(true)}>Add source</Button>
      </div>
      {!db ? <Skeleton className="h-24" /> : db.sources.length === 0 ? (
        <Empty title="Your library is empty" body="Upload PDFs or add details by hand. Suggestions and citations draw only on what is here." action={<Button variant="primary" onClick={() => setAdding(true)}>Add source</Button>} />
      ) : (
        <ul className="flex flex-col gap-2">
          {db.sources.map((s) => (
            <li key={s.id} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-raised p-4">
              <div className="min-w-0">
                <p className="break-words font-semibold">{s.title}</p>
                <p className="text-sm text-muted">{s.authors.join('; ') || 'Unknown author'} {s.year ? `· ${s.year}` : ''} {s.journal ? `· ${s.journal}` : ''}</p>
                <p className="text-xs text-muted">{s.chunks.length} passages {s.fileName ? `· ${s.fileName}` : ''} {s.sample ? '· sample (fictional)' : ''}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { const copy = structuredClone(s); deleteSource(s.id); toast(`Removed "${s.title}"`, () => addSource({ ...copy })); }}>Remove</Button>
            </li>
          ))}
        </ul>
      )}
      {adding && <SourceDialog onClose={() => setAdding(false)} />}
    </AppShell>
  );
}
