'use client';
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import { useContext } from 'react';
import { CiteCtx } from './ctx';
import { inText } from '@/lib/format';

function View({ node }: NodeViewProps) {
  const { sources, style, order } = useContext(CiteCtx);
  const s = sources.find((x) => x.id === node.attrs.sourceId);
  const chunk = s?.chunks.find((c) => c.id === node.attrs.chunkId);
  const label = s ? inText(style, s, order.indexOf(s.id) + 1) : '(source removed)';
  const full = s ? `${s.title}${s.year ? ` (${s.year})` : ''}${chunk ? ` - p.${chunk.page}: "${chunk.text.slice(0, 160)}..."` : ''}` : 'This source is no longer in your library';
  return (
    <NodeViewWrapper as="span" className="citation-chip" data-broken={!s} title={full} role="button" tabIndex={0} aria-label={`Citation: ${full}`}>
      {label}
    </NodeViewWrapper>
  );
}

// Inline atom. Stores which source (and which passage of it) a sentence came from: that is the "trace to source".
export const Citation = Node.create({
  name: 'citation', group: 'inline', inline: true, atom: true, selectable: true,
  addAttributes() { return { sourceId: { default: '' }, chunkId: { default: '' } }; },
  parseHTML() { return [{ tag: 'span[data-citation]' }]; },
  renderHTML({ HTMLAttributes }) { return ['span', mergeAttributes({ 'data-citation': '' }, HTMLAttributes)]; },
  addNodeView() { return ReactNodeViewRenderer(View); },
});
