'use client';
import { useSyncExternalStore } from 'react';
import type { CitationStyle, DB, DocRecord, Plan, Source } from './types';
import { seedDB } from './seed';
import { PLANS, usageKey } from './plans';

// Fake data layer: localStorage. Mutators below keep the shape a real backend will have
// (createDocument, updateDocument, addSource, ...), so /replica-backend swaps this file, not the screens.
const KEY = 'draftbook:v1';
let cache: DB | null = null;
const listeners = new Set<() => void>();

function load(): DB {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw) as DB; } catch {}
  return seedDB();
}
function read(): DB | null {
  if (typeof window === 'undefined') return null;
  if (!cache) cache = load();
  return cache;
}
function commit(next: DB) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  listeners.forEach((l) => l());
}
const mutate = (fn: (db: DB) => void) => { const db = structuredClone(read()!); fn(db); commit(db); };
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
export const useDB = (): DB | null => useSyncExternalStore(subscribe, read, () => null);

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const signIn = (email: string) => mutate((d) => { d.user = { email }; });
export const signOut = () => mutate((d) => { d.user = null; });
export const setPlan = (plan: Plan) => mutate((d) => { d.plan = plan; });
export const setAutocomplete = (on: boolean) => mutate((d) => { d.autocompleteEnabled = on; });

export function createDocument(title = 'Untitled'): string {
  const id = uid();
  mutate((d) => d.docs.unshift({ id, title, style: 'apa', updatedAt: new Date().toISOString(), archivedAt: null,
    content: { type: 'doc', content: [{ type: 'paragraph' }] } }));
  return id;
}
export const updateDocument = (id: string, patch: Partial<Pick<DocRecord, 'title' | 'content' | 'style'>>) =>
  mutate((d) => { const x = d.docs.find((y) => y.id === id); if (x) Object.assign(x, patch, { updatedAt: new Date().toISOString() }); });
export const archiveDocument = (id: string, archived: boolean) =>
  mutate((d) => { const x = d.docs.find((y) => y.id === id); if (x) x.archivedAt = archived ? new Date().toISOString() : null; });

export const addSource = (s: Omit<Source, 'id' | 'createdAt'>): string => {
  const id = uid();
  mutate((d) => d.sources.unshift({ ...s, id, createdAt: new Date().toISOString() }));
  return id;
};
export const deleteSource = (id: string) => mutate((d) => { d.sources = d.sources.filter((s) => s.id !== id); });

// ----- usage metering -----
export function usageNow(db: DB) {
  const key = usageKey(db.plan);
  const used = db.usage.key === key ? db.usage.used : 0;
  const limit = PLANS[db.plan].autocomplete;
  return { used, limit, left: Math.max(0, limit - used), reached: used >= limit };
}
export function countAutocomplete(): boolean {
  const db = read()!; const u = usageNow(db);
  if (u.reached) return false;
  mutate((d) => { d.usage = { key: usageKey(d.plan), used: u.used + 1 }; });
  return true;
}
export type { CitationStyle };
