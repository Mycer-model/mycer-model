import { NextResponse } from 'next/server';
import { createGeneration, listGenerations } from '@/lib/data';
import { createGenerationSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json(await listGenerations()); }
export async function POST(req: Request) {
  const who = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'; // replace with the user id once auth exists
  const rl = rateLimit(`gen:${who}`, Number(process.env.RATE_LIMIT_PER_MIN ?? 20), 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests. Try again shortly.' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } });
  const parsed = createGenerationSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'That request is not valid.' }, { status: 400 });
  try {
    return NextResponse.json(await createGeneration(parsed.data), { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Something went wrong.';
    return NextResponse.json({ error: msg === 'INSUFFICIENT_CREDITS' ? 'Not enough credits for this generation.' : msg }, { status: msg === 'INSUFFICIENT_CREDITS' ? 402 : 400 });
  }
}
