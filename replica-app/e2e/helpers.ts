import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
// Every spec fails on console errors and on any 5xx response.
export function guard(page: Page) {
  const problems: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('response', (r) => { if (r.status() >= 500) problems.push(`5xx: ${r.status()} ${r.url()}`); });
  return { check: () => expect(problems, problems.join('\n')).toEqual([]) };
}
export async function a11y(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  return r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s)`);
}
export async function create(page: Page, prompt: string) {
  await page.goto('/generate');
  await page.getByLabel('Prompt').fill(prompt);
  await page.getByRole('button', { name: 'Create' }).click();
  await page.waitForURL('**/assets/**');
}
export const credits = async (page: Page) => Number((await page.getByLabel('Credit balance').innerText()).match(/\d+/)![0]);
