import type { CitationStyle, Source } from './types';
const family = (a: string) => a.split(',')[0].trim();
const initials = (a: string) => (a.split(',')[1] ?? '').trim().split(/\s+/).filter(Boolean).map((n) => n[0].toUpperCase() + '.').join(' ');

export function inText(style: CitationStyle, s: Source, number: number): string {
  if (style === 'ieee') return `[${number}]`;
  const n = s.authors.length;
  const who = n === 0 ? s.title : n === 1 ? family(s.authors[0]) : n === 2 ? `${family(s.authors[0])} & ${family(s.authors[1])}` : `${family(s.authors[0])} et al.`;
  return `(${who}, ${s.year ?? 'n.d.'})`;
}

export interface Seg { text: string; italic?: boolean }
// A reference entry as segments, so React and the docx exporter render the same text.
export function reference(style: CitationStyle, s: Source, number: number): Seg[] {
  const doi = s.doi ? [{ text: ` https://doi.org/${s.doi}` }] : [];
  if (style === 'ieee') {
    const au = s.authors.map((a) => `${initials(a)} ${family(a)}`.trim()).join(', ');
    return [{ text: `[${number}] ${au ? au + ', ' : ''}"${s.title}," ` }, ...(s.journal ? [{ text: s.journal, italic: true }, { text: ', ' }] : []), { text: `${s.year ?? 'n.d.'}.` }, ...doi];
  }
  const names = s.authors.map((a) => `${family(a)}, ${initials(a)}`.replace(/, $/, ''));
  const au = names.length <= 1 ? names[0] ?? '' : names.slice(0, -1).join(', ') + ', & ' + names[names.length - 1];
  return [{ text: `${au ? au + ' ' : ''}(${s.year ?? 'n.d.'}). ${s.title}. ` }, ...(s.journal ? [{ text: s.journal, italic: true }, { text: '.' }] : []), ...doi];
}

// Order: APA alphabetical by first author; IEEE by first appearance.
export function bibliography(style: CitationStyle, order: string[], sources: Source[]) {
  const list = order.map((id) => sources.find((s) => s.id === id)).filter(Boolean) as Source[];
  if (style === 'apa') list.sort((a, b) => (family(a.authors[0] ?? a.title)).localeCompare(family(b.authors[0] ?? b.title)));
  return list.map((s) => ({ source: s, number: order.indexOf(s.id) + 1 }));
}
export const bibliographyHeading = (style: CitationStyle) => (style === 'ieee' ? 'References' : 'References');

export function citedIds(content: any): string[] {
  const ids: string[] = [];
  const walk = (n: any) => { if (!n) return; if (n.type === 'citation' && !ids.includes(n.attrs?.sourceId)) ids.push(n.attrs.sourceId); (n.content ?? []).forEach(walk); };
  walk(content);
  return ids;
}
