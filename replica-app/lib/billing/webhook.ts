// Stripe webhook core: pure and testable. The route verifies the signature, then hands the event here.
// Every handler is idempotent: an event id is recorded once, a repeat does nothing.
export interface BillingStore {
  hasEvent(id: string): Promise<boolean>;
  recordEvent(id: string, type: string): Promise<void>;
  setSubscription(s: { workspaceId: string; stripeSubscriptionId: string; status: string; plan: string; currentPeriodEnd: number | null }): Promise<void>;
  grantCredits(workspaceId: string, amount: number, reason: 'plan_grant' | 'purchase', stripeEventId: string): Promise<void>;
}
export interface StripeEventLike { id: string; type: string; data: { object: any } }
export const PLAN_CREDITS: Record<string, number> = { standard: 625, pro: 2250, max: 9500, team: 6900 };

export async function handleStripeEvent(store: BillingStore, ev: StripeEventLike): Promise<'handled' | 'duplicate' | 'ignored'> {
  if (await store.hasEvent(ev.id)) return 'duplicate';
  const o = ev.data.object;
  let result: 'handled' | 'ignored' = 'handled';
  switch (ev.type) {
    case 'checkout.session.completed': {
      const ws = o.client_reference_id ?? o.metadata?.workspace_id;
      if (!ws) { result = 'ignored'; break; }
      if (o.mode === 'payment') await store.grantCredits(ws, Number(o.metadata?.credits ?? 0), 'purchase', ev.id);
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const ws = o.metadata?.workspace_id;
      if (!ws) { result = 'ignored'; break; }
      const deleted = ev.type.endsWith('deleted');
      await store.setSubscription({ workspaceId: ws, stripeSubscriptionId: o.id, status: deleted ? 'canceled' : o.status, plan: deleted ? 'free' : (o.metadata?.plan ?? 'free'), currentPeriodEnd: o.current_period_end ?? null });
      break;
    }
    case 'invoice.paid': {
      const ws = o.subscription_details?.metadata?.workspace_id;
      const plan = o.subscription_details?.metadata?.plan;
      if (ws && plan && PLAN_CREDITS[plan]) await store.grantCredits(ws, PLAN_CREDITS[plan], 'plan_grant', ev.id);
      else result = 'ignored';
      break;
    }
    case 'invoice.payment_failed': {
      const ws = o.subscription_details?.metadata?.workspace_id;
      if (ws) await store.setSubscription({ workspaceId: ws, stripeSubscriptionId: o.subscription, status: 'past_due', plan: o.subscription_details?.metadata?.plan ?? 'free', currentPeriodEnd: null });
      else result = 'ignored';
      break;
    }
    default: result = 'ignored';
  }
  await store.recordEvent(ev.id, ev.type);
  return result;
}
