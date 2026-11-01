'use client';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Citation } from './CitationNode';
import { GhostText, setGhost } from './GhostText';
import { CitePicker } from './CitePicker';
import { CiteCtx } from './ctx';
import { Button } from '../ui';
import { suggest, type Suggestion } from '@/lib/retrieval';
import { bibliography, citedIds, reference } from '@/lib/format';
import { countAutocomplete, setAutocomplete, updateDocument, usageNow, useDB } from '@/lib/store';
import type { CitationStyle, DocRecord, Source } from '@/lib/types';

const WAIT_MS = 800;

// Context for a suggestion = the paragraph being written plus the nearest heading above it.
function contextAt(editor: any): string | null {
  const { $from, empty } = editor.state.selection;
  if (!empty || $from.parent.type.name !== 'paragraph' || $from.parentOffset !== $from.parent.content.size) return null; // only at the end of a paragraph
  const para = $from.parent.textContent;
  if (para.trim().split(/\s+/).length < 6) return null;
  let heading = '';
  editor.state.doc.forEach((n: any, off: number) => { if (n.type.name === 'heading' && off < $from.before()) heading = n.textContent; });
  return `${heading} ${para}`;
}

export function Editor({ doc, sources, onEditor }: { doc: DocRecord; sources: Source[]; onEditor?: (e: any) => void }) {
  const db = useDB()!;
  const [picker, setPicker] = useState(false);
  const [announce, setAnnounce] = useState('');
  const [saved, setSaved] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const save = useRef<ReturnType<typeof setTimeout>>(undefined);
  const live = useRef({ sources, enabled: db.autocompleteEnabled, reached: usageNow(db).reached });
  live.current = { sources, enabled: db.autocompleteEnabled, reached: usageNow(db).reached };
  const [order, setOrder] = useState<string[]>(() => citedIds(doc.content));

  const propose = useCallback((editor: any, force = false) => {
    const l = live.current;
    if (!force && (!l.enabled || l.reached)) return;
    const ctx = contextAt(editor);
    if (!ctx) { if (force) setAnnounce('Write a sentence or two first, then ask for a suggestion.'); return; }
    const s = suggest(ctx, l.sources, editor.getText());
    if (s) { setGhost(editor.view, s); setAnnounce(`Suggestion: ${s.text}. Press Tab to accept, Escape to dismiss.`); }
    else if (force) setAnnounce('No supporting passage found in your library for this sentence.');
  }, []);

  const accept = useCallback((editor: any, s: Suggestion) => {
    if (!countAutocomplete()) { setAnnounce('Daily suggestion limit reached.'); return; }
    editor.chain().focus().insertContent([{ type: 'text', text: ' ' + s.text }, { type: 'citation', attrs: { sourceId: s.sourceId, chunkId: s.chunkId } }]).run();
    setAnnounce('Suggestion added with its citation.');
  }, []);

  const editorRef = useRef<any>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit, Citation,
      Placeholder.configure({ placeholder: 'Start writing. Type @ to cite a source, or pause and Tab accepts a suggestion.' }),
      GhostText.configure({ onAccept: (s) => accept(editorRef.current, s), onForce: () => propose(editorRef.current, true) }),
    ],
    content: doc.content,
    editorProps: {
      attributes: { role: 'textbox', 'aria-multiline': 'true', 'aria-label': 'Document body' },
      handleKeyDown: (_v, e) => { if (e.key === '@') { e.preventDefault(); setPicker(true); return true; } return false; },
    },
    onUpdate: ({ editor }) => {
      setSaved(false);
      setOrder(citedIds(editor.getJSON()));
      clearTimeout(timer.current); timer.current = setTimeout(() => propose(editor), WAIT_MS);
      clearTimeout(save.current); save.current = setTimeout(() => { updateDocument(doc.id, { content: editor.getJSON() }); setSaved(true); }, 500);
    },
  });
  useEffect(() => { editorRef.current = editor; onEditor?.(editor); }, [editor, onEditor]);
  useEffect(() => () => { clearTimeout(timer.current); clearTimeout(save.current); }, []);

  const ctx = useMemo(() => ({ sources, style: doc.style as CitationStyle, order }), [sources, doc.style, order]);
  const bib = bibliography(doc.style, order, sources);

  return (
    <CiteCtx.Provider value={ctx}>
      <div role="toolbar" aria-label="Formatting" className="mb-3 flex flex-wrap items-center gap-1">
        {([
          ['Bold', () => editor?.chain().focus().toggleBold().run(), 'bold'],
          ['Italic', () => editor?.chain().focus().toggleItalic().run(), 'italic'],
          ['H2', () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), 'heading'],
          ['List', () => editor?.chain().focus().toggleBulletList().run(), 'bulletList'],
        ] as const).map(([l, fn, mark]) => (
          <Button key={l} size="sm" variant={editor?.isActive(mark) ? 'primary' : 'secondary'} aria-pressed={!!editor?.isActive(mark)} onClick={fn}>{l}</Button>
        ))}
        <Button size="sm" onClick={() => setPicker(true)}>Cite</Button>
        <label className="ml-auto flex items-center gap-2 text-sm">
          <input type="checkbox" checked={db.autocompleteEnabled} onChange={(e) => setAutocomplete(e.target.checked)} /> Suggestions
        </label>
        <Button size="sm" variant="ghost" onClick={() => propose(editor, true)} title="Ctrl or Cmd + /">Suggest now</Button>
        <span className="text-xs text-muted" aria-live="polite">{saved ? 'Saved' : 'Saving...'}</span>
      </div>
      <div className="doc rounded-sm bg-bg p-6 shadow-card md:px-16 md:py-14">
        <EditorContent editor={editor} />
        {bib.length > 0 && (
          <section aria-label="References" className="mt-10 border-t border-border pt-4 font-sans">
            <h2 className="mb-2 text-lg font-semibold">References</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {bib.map(({ source, number }) => (
                <li key={source.id} className={doc.style === 'apa' ? 'pl-6 -indent-6' : ''}>
                  {reference(doc.style, source, number).map((g, i) => g.italic ? <em key={i}>{g.text}</em> : <span key={i}>{g.text}</span>)}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <div className="sr-only" aria-live="polite">{announce}</div>
      {db.autocompleteEnabled && usageNow(db).reached && (
        <p role="alert" className="mt-3 rounded-md border border-border bg-surface p-3 text-sm">You have used all of your suggestions for now. They pause until the limit resets, or you can <a className="underline" href="/pricing">change plan</a>.</p>
      )}
      {picker && <CitePicker sources={sources} onClose={() => { setPicker(false); editor?.commands.focus(); }}
        onPick={(s) => { setPicker(false); editor?.chain().focus().insertContent({ type: 'citation', attrs: { sourceId: s.id, chunkId: s.chunks[0]?.id ?? '' } }).run(); }} />}
    </CiteCtx.Provider>
  );
}
