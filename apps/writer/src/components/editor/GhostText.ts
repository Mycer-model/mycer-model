import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Suggestion } from '@/lib/retrieval';

export const ghostKey = new PluginKey<Suggestion | null>('ghost');
export const setGhost = (view: any, s: Suggestion | null) => view.dispatch(view.state.tr.setMeta(ghostKey, { s }));

// Gray inline suggestion after the cursor. Any edit or cursor move clears it.
export const GhostText = Extension.create<{ onAccept: (s: Suggestion) => void; onForce: () => void }>({
  name: 'ghostText',
  addOptions() { return { onAccept: () => {}, onForce: () => {} }; },
  addProseMirrorPlugins() {
    return [new Plugin<Suggestion | null>({
      key: ghostKey,
      state: {
        init: () => null,
        apply(tr, v) {
          const m = tr.getMeta(ghostKey);
          if (m !== undefined) return m.s;
          return tr.docChanged || tr.selectionSet ? null : v;
        },
      },
      props: {
        decorations(state) {
          const s = ghostKey.getState(state);
          if (!s || !state.selection.empty) return null;
          const el = document.createElement('span');
          el.className = 'ghost-text'; el.textContent = ' ' + s.text; el.setAttribute('aria-hidden', 'true');
          return DecorationSet.create(state.doc, [Decoration.widget(state.selection.to, el, { side: 1, key: 'ghost' })]);
        },
      },
    })];
  },
  addKeyboardShortcuts() {
    const accept = ({ editor }: any) => { const s = ghostKey.getState(editor.state); if (!s) return false; this.options.onAccept(s); return true; };
    return {
      Tab: accept,
      ArrowRight: accept,
      Escape: ({ editor }: any) => { if (!ghostKey.getState(editor.state)) return false; setGhost(editor.view, null); return true; },
      'Mod-/': () => { this.options.onForce(); return true; },
    };
  },
});
