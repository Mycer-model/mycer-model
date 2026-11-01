// Stand-in store until the Postgres data layer is connected (stripe_events and subscriptions tables exist in the migration).
import type { BillingStore } from './webhook';
interface State { events: Set<string>; subs: Map<string, unknown>; grants: Array<Record<string, unknown>> }
const g = globalThis as unknown as { __billing?: State };
const s: State = (g.__billing ??= { events: new Set<string>(), subs: new Map<string, unknown>(), grants: [] as Array<Record<string, unknown>> });
export const memoryBillingStore: BillingStore = {
  async hasEvent(id) { return s.events.has(id); },
  async recordEvent(id) { s.events.add(id); },
  async setSubscription(x) { s.subs.set(x.workspaceId, x); },
  async grantCredits(workspaceId, amount, reason, stripeEventId) { s.grants.push({ workspaceId, amount, reason, stripeEventId }); },
};
