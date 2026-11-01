'use client';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import type { CitationStyle, Source } from './types';
import { bibliography, citedIds, inText, reference } from './format';

// Citations are exported as hyperlink-free plain text for now. Native Word citation fields are a later milestone.
export async function exportDocx(title: string, content: any, style: CitationStyle, sources: Source[], withBibliography: boolean) {
  const order = citedIds(content);
  const label = (id: string) => { const s = sources.find((x) => x.id === id); return s ? inText(style, s, order.indexOf(id) + 1) : '[?]'; };
  const runs = (n: any): TextRun[] => (n.content ?? []).flatMap((c: any) => {
    if (c.type === 'text') return [new TextRun({ text: c.text, bold: c.marks?.some((m: any) => m.type === 'bold'), italics: c.marks?.some((m: any) => m.type === 'italic') })];
    if (c.type === 'citation') return [new TextRun(' ' + label(c.attrs.sourceId))];
    return [];
  });
  const block = (n: any, list = false): Paragraph[] => {
    if (n.type === 'heading') return [new Paragraph({ heading: [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4][(n.attrs?.level ?? 1) - 1], children: runs(n) })];
    if (n.type === 'paragraph') return [new Paragraph({ children: runs(n), bullet: list ? { level: 0 } : undefined })];
    if (n.type === 'bulletList' || n.type === 'orderedList') return (n.content ?? []).flatMap((li: any) => (li.content ?? []).flatMap((x: any) => block(x, true)));
    if (n.type === 'blockquote') return (n.content ?? []).flatMap((x: any) => block(x));
    return [];
  };
  const body = (content.content ?? []).flatMap((n: any) => block(n));
  const refs = withBibliography && order.length
    ? [new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('References')] }),
       ...bibliography(style, order, sources).map(({ source, number }) =>
         new Paragraph({ children: reference(style, source, number).map((g) => new TextRun({ text: g.text, italics: g.italic })) }))]
    : [];
  const doc = new Document({ title, sections: [{ children: [new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun(title)] }), ...body, ...refs] }] });
  const blob = await Packer.toBlob(doc);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `${title.replace(/[^\w\- ]+/g, '').trim() || 'document'}.docx`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
