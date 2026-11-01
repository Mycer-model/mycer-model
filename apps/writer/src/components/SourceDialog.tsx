'use client';
import { useState } from 'react';
import { Button, Dialog, Field, inputCls } from './ui';
import { addSource, useDB } from '@/lib/store';
import { readPdf, UploadError } from '@/lib/pdf';
import { PLANS } from '@/lib/plans';
import type { Chunk } from '@/lib/types';

// Add a source: upload a PDF (text read in the browser) or type the details. Metadata is always editable.
export function SourceDialog({ onClose, onAdded }: { onClose: () => void; onAdded?: (id: string) => void }) {
  const db = useDB()!;
  const [title, setTitle] = useState(''); const [authors, setAuthors] = useState(''); const [year, setYear] = useState('');
  const [journal, setJournal] = useState(''); const [doi, setDoi] = useState(''); const [text, setText] = useState('');
  const [chunks, setChunks] = useState<Chunk[]>([]); const [fileName, setFileName] = useState<string>();
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [fieldErr, setFieldErr] = useState('');
  const uploads = db.sources.filter((s) => s.fileName).length;
  const lim = PLANS[db.plan];

  async function onFile(f: File | undefined) {
    if (!f) return; setErr('');
    if (uploads >= lim.maxUploads) return setErr(`The ${lim.label} plan allows ${lim.maxUploads} PDF uploads. Change plan for more.`);
    setBusy(true);
    try { const r = await readPdf(f, db.plan); setChunks(r.chunks); setFileName(f.name); if (!title) setTitle(r.title); }
    catch (e) { setErr(e instanceof UploadError ? e.message : 'Something went wrong reading this file.'); }
    finally { setBusy(false); }
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setFieldErr('Give the source a title.');
    let cs = chunks;
    if (!cs.length && text.trim()) { const w = text.trim().split(/\s+/); cs = []; for (let i = 0; i < w.length; i += 110) cs.push({ id: `t-${i / 110}`, page: 1, text: w.slice(i, i + 110).join(' ') }); }
    const id = addSource({ title: title.trim(), authors: authors.split(';').map((a) => a.trim()).filter(Boolean), year: Number(year) || undefined, journal: journal.trim() || undefined, doi: doi.trim() || undefined, fileName, chunks: cs });
    onAdded?.(id); onClose();
  }
  return (
    <Dialog title="Add a source" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div>
          <label htmlFor="pdf" className="text-sm font-medium">PDF file (up to {lim.maxPdfMb} MB, {lim.maxPdfPages} pages)</label>
          <input id="pdf" type="file" accept="application/pdf" className="mt-1 block w-full text-sm" onChange={(e) => onFile(e.target.files?.[0])} />
          {busy && <p className="mt-1 text-sm text-muted" role="status">Reading the PDF...</p>}
          {fileName && !busy && <p className="mt-1 text-sm text-success" role="status">Read {chunks.length} passages from {fileName}.</p>}
          {err && <p role="alert" className="mt-1 text-sm text-danger">{err}</p>}
        </div>
        <Field label="Title" error={fieldErr}><input className={inputCls} value={title} onChange={(e) => { setTitle(e.target.value); setFieldErr(''); }} /></Field>
        <Field label="Authors (Family, Given; separate with semicolons)"><input className={inputCls} value={authors} onChange={(e) => setAuthors(e.target.value)} placeholder="Okafor, Ngozi; Marsh, Eleanor" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Year"><input className={inputCls} inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} /></Field>
          <Field label="DOI"><input className={inputCls} value={doi} onChange={(e) => setDoi(e.target.value)} /></Field>
        </div>
        <Field label="Journal"><input className={inputCls} value={journal} onChange={(e) => setJournal(e.target.value)} /></Field>
        {!chunks.length && <Field label="Or paste text from the source"><textarea className={inputCls + ' h-24 py-2'} value={text} onChange={(e) => setText(e.target.value)} /></Field>}
        <div className="flex justify-end gap-2"><Button type="button" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" loading={busy}>Add to library</Button></div>
      </form>
    </Dialog>
  );
}
