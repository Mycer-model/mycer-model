'use client';
import type { Chunk } from './types';
import { PLANS } from './plans';
import type { Plan } from './types';

export class UploadError extends Error {}

// Reads a PDF in the browser (the user's own file; nothing is sent anywhere in this slice).
export async function readPdf(file: File, plan: Plan): Promise<{ title: string; chunks: Chunk[]; pages: number }> {
  const lim = PLANS[plan];
  if (file.size > lim.maxPdfMb * 1024 * 1024) throw new UploadError(`This file is over the ${lim.maxPdfMb} MB limit for the ${lim.label} plan.`);
  const pdfjs: any = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url).toString();
  let doc: any;
  try { doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise; }
  catch (e: any) {
    if (e?.name === 'PasswordException') throw new UploadError('This PDF is password protected, so it cannot be read.');
    throw new UploadError('This file could not be read as a PDF.');
  }
  if (doc.numPages > lim.maxPdfPages) throw new UploadError(`This PDF has ${doc.numPages} pages; the ${lim.label} plan allows ${lim.maxPdfPages}.`);
  const chunks: Chunk[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const text = (await page.getTextContent()).items.map((i: any) => i.str).join(' ').replace(/\s+/g, ' ').trim();
    const words = text.split(' ').filter(Boolean);
    for (let i = 0; i < words.length; i += 110) chunks.push({ id: `p${p}-${i / 110}`, page: p, text: words.slice(i, i + 110).join(' ') });
  }
  if (!chunks.length) throw new UploadError('No text found. Scanned PDFs need OCR, which is not built yet.');
  const meta = await doc.getMetadata().catch(() => null);
  const title = (meta?.info?.Title as string) || file.name.replace(/\.pdf$/i, '');
  return { title, chunks, pages: doc.numPages };
}
