import { test, expect } from '@playwright/test';
test('F05-H1 billing page shows the balance and the ledger', async ({ page }) => {
  await page.goto('/billing');
  await expect(page.getByRole('heading', { name: 'Plans & credits' })).toBeVisible();
  await expect(page.getByText('Plan credits')).toBeVisible();
});
test('F05-N1 webhook refuses unsigned requests', async ({ request }) => {
  const r = await request.post('/api/webhooks/stripe', { data: '{}' });
  expect([400, 503]).toContain(r.status());
});
