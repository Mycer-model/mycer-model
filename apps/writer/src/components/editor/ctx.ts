'use client';
import { createContext } from 'react';
import type { CitationStyle, Source } from '@/lib/types';
export const CiteCtx = createContext<{ sources: Source[]; style: CitationStyle; order: string[] }>({ sources: [], style: 'apa', order: [] });
