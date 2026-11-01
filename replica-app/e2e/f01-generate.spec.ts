import { test, expect } from '@playwright/test';
import { guard, a11y, create, credits } from './helpers';

test('F01-H1 create an image and see it', async ({ page }) => {
  const g = guard(page);
  await page.goto('/generate');
  await page.getByLabel('Model').selectOption({ label: /Still image/ as any }).catch(async () => page.getByLabel('Model').selectOption('mock-image'));
  await page.getByLabel('Prompt').fill('A lighthouse at night');
  await page.getByRole('button', { name: 'Create' }).click();
  await page.waitForURL('**/assets/**');
  await expect(page.getByText('Working on it')).toBeVisible();
  await expect(page.getByRole('img', { name: 'A lighthouse at night' })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('link', { name: 'Download' })).toBeVisible();
  g.check();
});

test('F01-E1 empty or blank prompt cannot be submitted', async ({ page }) => {
  await page.goto('/generate');
  await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
  await page.getByLabel('Prompt').fill('   ');
  await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
});

test('F01-E2 a prompt over the model limit is blocked before sending', async ({ page }) => {
  await page.goto('/generate');
  await page.getByLabel('Prompt').fill('x'.repeat(900)); // draft video allows 800
  await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
});

test('F01-E3 emoji and accents in the prompt still produce a result', async ({ page }) => {
  const g = guard(page);
  await page.goto('/generate');
  await page.getByLabel('Model').selectOption('mock-image');
  // an emoji that straddles the 60-character cut used for the poster caption
  await page.getByLabel('Prompt').fill('é'.repeat(59) + '😀 fin');
  await page.getByRole('button', { name: 'Create' }).click();
  await page.waitForURL('**/assets/**');
  await expect(page.getByRole('img').first()).toBeVisible({ timeout: 10_000 });
  g.check();
});

test('F01-E4 double click on Create makes one charge', async ({ page }) => {
  await page.goto('/generate');
  await page.getByLabel('Model').selectOption('mock-image');
  const before = await credits(page);
  await page.getByLabel('Prompt').fill('double click');
  await page.getByRole('button', { name: 'Create' }).dblclick();
  await page.waitForURL('**/assets/**');
  await page.goto('/');
  expect(before - (await credits(page))).toBe(4);
});

test('F01-E5 failed generation returns the credits', async ({ page }) => {
  await page.goto('/generate');
  await page.getByLabel('Model').selectOption('mock-image');
  const before = await credits(page);
  await page.getByLabel('Prompt').fill('please fail');
  await page.getByRole('button', { name: 'Create' }).click();
  await page.waitForURL('**/assets/**');
  await expect(page.getByText('That did not work')).toBeVisible({ timeout: 10_000 });
  await page.goto('/');
  expect(await credits(page)).toBe(before);
});

test('F01-E6 stopping a running generation returns the credits', async ({ page }) => {
  await page.goto('/generate');
  await page.getByLabel('Model').selectOption('mock-image');
  const before = await credits(page);
  await page.getByLabel('Prompt').fill('stop me');
  await page.getByRole('button', { name: 'Create' }).click();
  await page.waitForURL('**/assets/**');
  await page.getByRole('button', { name: 'Stop' }).click();
  await expect(page.getByText('Stopped')).toBeVisible();
  await page.goto('/');
  expect(await credits(page)).toBe(before);
});

test('F01-E7 model switch keeps the form valid for the new model', async ({ page }) => {
  await page.goto('/generate');
  await page.getByLabel('Model').selectOption('mock-video-pro'); // ratio 1:1 and 10s exist only on this model
  await page.getByLabel('Shape').selectOption('1:1');
  await page.getByLabel('Model').selectOption('mock-video-fast'); // 1:1 does not exist here
  await expect(page.getByLabel('Shape')).not.toHaveValue('1:1');
});

test('F01-E8 not enough credits: button disabled and server refuses', async ({ page, request }) => {
  const body = { model: 'mock-video-pro', prompt: 'big', ratio: '16:9', duration: 10 }; // 120 credits each
  let status = 0;
  for (let i = 0; i < 3 && status !== 402; i++) status = (await request.post('/api/generations', { data: body })).status();
  expect(status).toBe(402);
  await page.goto('/generate');
  await page.getByLabel('Model').selectOption('mock-video-pro');
  await page.getByLabel('Length (seconds)').selectOption('10');
  await page.getByLabel('Prompt').fill('too big now');
  await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
});

test('F01-N1 invalid requests are rejected by the server', async ({ request }) => {
  expect((await request.post('/api/generations', { data: { nope: 1 } })).status()).toBe(400);
  expect((await request.post('/api/generations', { data: { model: 'mock-image', prompt: 'x', ratio: '7:7' } })).status()).toBe(400);
  expect((await request.post('/api/generations', { data: { model: 'nope', prompt: 'x', ratio: '1:1' } })).status()).toBe(400);
  expect((await request.get('/api/generations/does-not-exist')).status()).toBe(404);
});

test('F01-N2 unknown asset id shows a not-found page', async ({ page }) => {
  const r = await page.goto('/assets/00000000-0000-0000-0000-000000000000');
  expect(r?.status()).toBe(404);
});

test('F01-N3 refresh mid-generation still ends in a result', async ({ page }) => {
  await create(page, 'refresh me');
  await page.reload();
  await expect(page.getByRole('img').first()).toBeVisible({ timeout: 10_000 });
});

test('F01-E9 mobile width has no horizontal scroll, even with a very long unbroken prompt', async ({ page, request }) => {
  await request.post('/api/generations', { data: { model: 'mock-image', prompt: 'x'.repeat(120), ratio: '1:1' } });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const url of ['/', '/generate', '/billing']) {
    await page.goto(url);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(over, url).toBeLessThanOrEqual(0);
  }
});

test('F01-E10 keyboard only: create from the form', async ({ page }) => {
  await page.goto('/generate');
  await page.getByLabel('Prompt').focus();
  await page.keyboard.type('keyboard only');
  await page.keyboard.press('Tab'); // shape
  await page.keyboard.press('Tab'); // length
  await page.keyboard.press('Tab'); // create
  await expect(page.getByRole('button', { name: 'Create' })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.waitForURL('**/assets/**');
});

test('F01-A1 accessibility scan on every screen', async ({ page }) => {
  const found: string[] = [];
  for (const url of ['/', '/generate', '/billing', '/projects', '/brand-kits', '/team', '/developers', '/login']) {
    await page.goto(url);
    for (const v of await a11y(page)) found.push(`${url}: ${v}`);
  }
  expect(found).toEqual([]);
});
