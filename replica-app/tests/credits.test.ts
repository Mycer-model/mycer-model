import { test } from 'node:test';
import assert from 'node:assert/strict';
import { balance, reserve, refund, type LedgerRow } from '../lib/credits.ts';
const seed: LedgerRow[] = [{ id: 's', delta: 100, reason: 'plan_grant', createdAt: 0 }];
test('reserve subtracts once and is idempotent', () => {
  const a = reserve(seed, 'g1', 30); const b = reserve(a, 'g1', 30);
  assert.equal(balance(a), 70); assert.equal(balance(b), 70);
});
test('reserve refuses when credits are short', () => { assert.throws(() => reserve(seed, 'g1', 101), /INSUFFICIENT_CREDITS/); });
test('refund returns credits exactly once', () => {
  const a = refund(reserve(seed, 'g1', 30), 'g1'); const b = refund(a, 'g1');
  assert.equal(balance(a), 100); assert.equal(balance(b), 100);
});
test('refund without a charge does nothing', () => { assert.equal(balance(refund(seed, 'nope')), 100); });
