import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rateLimit, _resetRateLimit } from '../lib/rate-limit.ts';
test('allows up to the limit, then blocks until the window ends', () => {
  _resetRateLimit();
  for (let i = 0; i < 3; i++) assert.ok(rateLimit('k', 3, 1000, 0).ok);
  assert.equal(rateLimit('k', 3, 1000, 500).ok, false);
  assert.ok(rateLimit('k', 3, 1000, 1000).ok);
});
test('keys are independent', () => { _resetRateLimit(); rateLimit('a', 1, 1000, 0); assert.ok(rateLimit('b', 1, 1000, 0).ok); });
