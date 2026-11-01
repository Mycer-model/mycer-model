'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { Button, Empty, Skeleton } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { archiveDocument, createDocument, useDB } from '@/lib/store';

// S02 documents home
export default function Documents() {
  const db = useDB();
  const router = useRouter();
  const toast = useToast();
  const docs = db?.docs.filter((d) => !d.archivedAt) ?? [];
  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Documents</h1>
        <Button variant="primary" onClick={() => router.push(`/documents/${createDocument()}`)}>New document</Button>
      </div>
      {!db ? <Skeleton className="h-24" /> : docs.length === 0 ? (
        <Empty title="No documents yet" body="Start a document, add a few PDFs to your library, and write with your sources beside you." action={<Button variant="primary" onClick={() => router.push(`/documents/${createDocument()}`)}>New document</Button>} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => (
            <li key={d.id} className="flex flex-col justify-between gap-3 rounded-lg border border-border bg-raised p-4 shadow-card">
              <div>
                <Link href={`/documents/${d.id}`} className="line-clamp-2 break-words font-semibold hover:underline">{d.title || 'Untitled'}</Link>
                <p className="text-xs text-muted">Edited {new Date(d.updatedAt).toLocaleString()}</p>
              </div>
              <Button size="sm" variant="ghost" className="self-start" onClick={() => { archiveDocument(d.id, true); toast(`Archived "${d.title}"`, () => archiveDocument(d.id, false)); }}>Archive</Button>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
