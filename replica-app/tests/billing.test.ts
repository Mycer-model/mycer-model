import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleStripeEvent, type BillingStore } from '../lib/billing/webhook.ts';
function store() {
  const events = new Set<string>(); const grants: any[] = []; const subs: any[] = [];
  const s: BillingStore = {
    async hasEvent(id) { return events.has(id); }, async recordEvent(id) { events.add(id); },
    async setSubscription(x) { subs.push(x); }, async grantCredits(w, a, r, e) { grants.push({ w, a, r, e }); },
  };
  return { s, grants, subs };
}
const WS = '10000000-0000-0000-0000-00000000000a';
test('a repeated event grants credits once', async () => {
  const { s, grants } = store();
  const ev = { id: 'evt_1', type: 'invoice.paid', data: { object: { subscription_details: { metadata: { workspace_id: WS, plan: 'pro' } } } } };
  assert.equal(await handleStripeEvent(s, ev), 'handled');
  assert.equal(await handleStripeEvent(s, ev), 'duplicate');
  assert.equal(grants.length, 1); assert.equal(grants[0].a, 2250);
});
test('top-up checkout grants the purchased credits', async () => {
  const { s, grants } = store();
  await handleStripeEvent(s, { id: 'evt_2', type: 'checkout.session.completed', data: { object: { mode: 'payment', client_reference_id: WS, metadata: { credits: '1000' } } } });
  assert.deepEqual(grants.map((g) => [g.a, g.r]), [[1000, 'purchase']]);
});
test('subscription deleted drops the workspace to free', async () => {
  const { s, subs } = store();
  await handleStripeEvent(s, { id: 'evt_3', type: 'customer.subscription.deleted', data: { object: { id: 'sub_1', metadata: { workspace_id: WS, plan: 'pro' } } } });
  assert.equal(subs[0].plan, 'free'); assert.equal(subs[0].status, 'canceled');
});
test('payment failure marks past_due', async () => {
  const { s, subs } = store();
  await handleStripeEvent(s, { id: 'evt_4', type: 'invoice.payment_failed', data: { object: { subscription: 'sub_1', subscription_details: { metadata: { workspace_id: WS, plan: 'pro' } } } } });
  assert.equal(subs[0].status, 'past_due');
});
test('unknown events are ignored but recorded', async () => {
  const { s } = store();
  assert.equal(await handleStripeEvent(s, { id: 'evt_5', type: 'charge.refunded', data: { object: {} } }), 'ignored');
  assert.equal(await handleStripeEvent(s, { id: 'evt_5', type: 'charge.refunded', data: { object: {} } }), 'duplicate');
});
