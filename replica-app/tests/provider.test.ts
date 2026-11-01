import { test } from 'node:test';
import assert from 'node:assert/strict';
process.env.MOCK_RUN_MS = '0';
const { mockProvider } = await import('../lib/providers/mock.ts');
test('an emoji at the caption cut does not crash the poll (bug B-001)', async () => {
  const { taskId } = await mockProvider.start({ model: 'mock-image', prompt: 'é'.repeat(59) + '😀 fin', ratio: '1:1' });
  const s = await mockProvider.poll(taskId);
  assert.equal(s.status, 'succeeded');
  assert.ok(s.outputUrl?.startsWith('data:image/svg+xml'));
});
test('markup in the prompt cannot break out of the SVG', async () => {
  const { taskId } = await mockProvider.start({ model: 'mock-image', prompt: '<script>alert(1)</script>"&', ratio: '1:1' });
  const s = await mockProvider.poll(taskId);
  assert.ok(!decodeURIComponent(s.outputUrl!).includes('<script>'));
});
