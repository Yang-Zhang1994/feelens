import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

const PAGES = ['/funds', '/compare?ids=cdn-eq-index,cdn-eq-active-a,balanced-etf'];

for (const path of PAGES) {
  test(`no accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('tbody tr').first()).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  test(`no horizontal scroll on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('tbody tr').first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('the fund list renders within the performance budget', async ({ page }) => {
  await page.goto('/funds');
  await expect(page.locator('tbody tr')).toHaveCount(8);
  const timing = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const scripts = performance
      .getEntriesByType('resource')
      .filter((r) => r.name.endsWith('.js')) as PerformanceResourceTiming[];
    return {
      domContentLoaded: nav.domContentLoadedEventEnd,
      tableShown: performance.now(),
      scriptBytes: scripts.reduce((sum, r) => sum + r.decodedBodySize, 0),
    };
  });
  // Local production build: these catch regressions such as an accidental heavy import, not real-network speed.
  expect(timing.domContentLoaded).toBeLessThan(1_000);
  expect(timing.tableShown).toBeLessThan(2_000);
  expect(timing.scriptBytes).toBeLessThan(350_000);
});
