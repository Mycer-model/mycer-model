import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { handleStripeEvent } from '@/lib/billing/webhook';
import { memoryBillingStore } from '@/lib/billing/memory-store';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET, key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) return NextResponse.json({ error: 'Billing is not configured.' }, { status: 503 });
  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });
  const raw = await req.text(); // the signature covers the raw body
  let event: Stripe.Event;
  try { event = Stripe.webhooks.constructEvent(raw, signature, secret); }
  catch { return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 }); }
  const result = await handleStripeEvent(memoryBillingStore, event as any);
  return NextResponse.json({ received: true, result });
}
