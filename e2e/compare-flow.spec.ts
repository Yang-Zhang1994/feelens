import { expect, test } from './fixtures';

const rowNames = (page: import('@playwright/test').Page) => page.locator('tbody th, tbody label');

test('filter, pick two funds, and compare them', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/funds$/);
  await expect(page.locator('tbody tr')).toHaveCount(8);

  await page.getByLabel('Category').selectOption('Equity');
  await expect(page.locator('tbody tr')).toHaveCount(4);

  await page.getByLabel('Canadian Equity Index ETF').check();
  await page.getByLabel('Canadian Equity Fund, Series A').check();
  await page.getByRole('button', { name: 'Compare 2 funds' }).click();

  await expect(page).toHaveURL(/\/compare\?ids=cdn-eq-index,cdn-eq-active-a$/);
  await expect(page).toHaveTitle('Compare · FeeLens');
  await expect(rowNames(page)).toHaveText(['Canadian Equity Index ETF', 'Canadian Equity Fund, Series A']);
  await expect(page.getByTestId('insight')).toHaveText(
    /^Over 25 years, Canadian Equity Fund, Series A \(2\.10%\) would leave you \$[\d,]+ less than Canadian Equity Index ETF \(0\.06%\)\.$/,
  );
  await expect(page.locator('app-growth-chart polyline')).toHaveCount(2);

  // Going back to edit keeps the picks.
  await page.getByRole('link', { name: 'Change funds' }).click();
  await expect(page.getByRole('button', { name: 'Compare 2 funds' })).toBeEnabled();
});

test('a shared comparison link works after a reload', async ({ page }) => {
  await page.goto('/compare?ids=balanced-active-a,balanced-etf,money-market');
  await page.reload();
  await expect(rowNames(page)).toHaveText(['Balanced Asset Allocation ETF', 'Money Market Fund', 'Balanced Income Fund, Series A']);
});

test('the fourth pick is blocked at three funds', async ({ page }) => {
  await page.goto('/funds');
  for (const name of ['Canadian Equity Index ETF', 'Global Equity Index ETF', 'Canadian Bond Index ETF']) {
    await page.getByLabel(name).check();
  }
  await expect(page.getByLabel('Money Market Fund')).toBeDisabled();
  await expect(page.getByText('3 of 3 selected')).toBeVisible();
});

test('invalid plan input shows a message instead of results', async ({ page }) => {
  await page.goto('/compare?ids=cdn-eq-index,cdn-eq-active-a');
  await page.getByLabel('Years invested').fill('60');
  await expect(page.locator('#years-error')).toHaveText('Enter a value from 1 to 50.');
  await expect(page.getByTestId('insight')).toHaveCount(0);

  await page.getByLabel('Years invested').fill('10');
  await expect(page.getByTestId('insight')).toContainText('Over 10 years');
});

test('an unknown route goes to the fund list', async ({ page }) => {
  await page.goto('/nope');
  await expect(page).toHaveURL(/\/funds$/);
});
