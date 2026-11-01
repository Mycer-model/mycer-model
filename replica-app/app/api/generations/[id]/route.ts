import { NextResponse } from 'next/server';
import { cancelGeneration, getGeneration } from '@/lib/data';
export const dynamic = 'force-dynamic';
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const gen = await getGeneration(params.id);
  return gen ? NextResponse.json(gen) : NextResponse.json({ error: 'Not found.' }, { status: 404 });
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const gen = await cancelGeneration(params.id);
  return gen ? NextResponse.json(gen) : NextResponse.json({ error: 'Not found.' }, { status: 404 });
}
