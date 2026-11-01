import { NextResponse } from 'next/server';
import { createGeneration, listGenerations } from '@/lib/data';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json(await listGenerations()); }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json(await createGeneration(body), { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Something went wrong.';
    return NextResponse.json({ error: msg === 'INSUFFICIENT_CREDITS' ? 'Not enough credits for this generation.' : msg }, { status: msg === 'INSUFFICIENT_CREDITS' ? 402 : 400 });
  }
}
