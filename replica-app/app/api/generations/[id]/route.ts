import { NextResponse } from 'next/server';
import { cancelGeneration, getGeneration } from '@/lib/data';
export const dynamic = 'force-dynamic';
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const gen = await getGeneration((await params).id);
  return gen ? NextResponse.json(gen) : NextResponse.json({ error: 'Not found.' }, { status: 404 });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const gen = await cancelGeneration((await params).id);
  return gen ? NextResponse.json(gen) : NextResponse.json({ error: 'Not found.' }, { status: 404 });
}
