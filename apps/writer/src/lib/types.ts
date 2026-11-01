export type Plan = 'free' | 'plus' | 'pro';
export type CitationStyle = 'apa' | 'ieee';

export interface Chunk { id: string; page: number; text: string }
export interface Source {
  id: string;
  title: string;
  authors: string[];          // "Family, Given"
  year?: number;
  journal?: string;
  doi?: string;
  fileName?: string;
  sample?: boolean;           // seed data, fictional
  chunks: Chunk[];
  createdAt: string;
}
export interface DocRecord {
  id: string;
  title: string;
  content: any;               // Tiptap JSON
  style: CitationStyle;
  updatedAt: string;
  archivedAt?: string | null;
}
export interface Usage { key: string; used: number }
export interface DB {
  user: { email: string } | null;
  plan: Plan;
  autocompleteEnabled: boolean;
  docs: DocRecord[];
  sources: Source[];
  usage: Usage;
}
