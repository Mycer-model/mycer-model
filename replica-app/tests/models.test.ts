import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getModel, validateRequest, costOf } from '../lib/models.ts';
const v = getModel('mock-video-fast')!; const img = getModel('mock-image')!;
test('cost per second and per generation', () => { assert.equal(costOf(v, 4), 24); assert.equal(costOf(img), 4); });
test('per-model validation', () => {
  assert.equal(validateRequest(v, { prompt: 'a', ratio: '16:9', duration: 4 }), null);
  assert.match(validateRequest(v, { prompt: 'a', ratio: '1:1', duration: 4 })!, /aspect ratio/);
  assert.match(validateRequest(v, { prompt: 'a', ratio: '16:9', duration: 5 })!, /duration/);
  assert.match(validateRequest(img, { prompt: '  ', ratio: '1:1' })!, /prompt/);
});
