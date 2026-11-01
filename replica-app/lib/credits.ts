// Credits are an append-only ledger. Balance = sum of deltas. Reserve and refund are idempotent per generation.
export interface LedgerRow { id: string; delta: number; reason: 'plan_grant' | 'purchase' | 'generation' | 'refund'; generationId?: string; createdAt: number }
export const balance = (rows: LedgerRow[]) => rows.reduce((s, r) => s + r.delta, 0);
export function reserve(rows: LedgerRow[], generationId: string, cost: number, now = Date.now()): LedgerRow[] {
  if (rows.some((r) => r.generationId === generationId && r.reason === 'generation')) return rows;
  if (balance(rows) < cost) throw new Error('INSUFFICIENT_CREDITS');
  return [...rows, { id: `${generationId}:gen`, delta: -cost, reason: 'generation', generationId, createdAt: now }];
}
export function refund(rows: LedgerRow[], generationId: string, now = Date.now()): LedgerRow[] {
  const spent = rows.find((r) => r.generationId === generationId && r.reason === 'generation');
  if (!spent || rows.some((r) => r.generationId === generationId && r.reason === 'refund')) return rows;
  return [...rows, { id: `${generationId}:refund`, delta: -spent.delta, reason: 'refund', generationId, createdAt: now }];
}
