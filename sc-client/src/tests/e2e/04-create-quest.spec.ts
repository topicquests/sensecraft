import { test, expect } from '@playwright/test';
import { firstNode, mockQuest, questCreator } from '../utilities/StoreMocks';
import { DateTime } from 'luxon';

test.describe('Quest creator Permission Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/signin');
    await page.fill('input[name="email"]', questCreator.email!);
    await page.fill('input[name="pass"]', questCreator.password!);
    await page.click('button[name="loginBtn"]');
    await page.click('button[name="dashboardInstruction"]');
  });

  test('Quest creator can go to create quest page', async ({ page }) => {
    await page.click('button[name="leftdrawerBtn"]');
    await page.locator('[data-test=create-quest-link]').click();
    await expect(page).toHaveURL(/\/quest\/create$/);
  });

  test('Quest creator create quest', async ({ page }) => {
    const start = DateTime.now().plus({ days: 1 });
    const end = start.plus({ months: 6 });

    const startDate = start.toFormat('yyyy-MM-dd');
    const startTime = start.toFormat('HH:mm');
    const endDate = end.toFormat('yyyy-MM-dd');
    const endTime = end.toFormat('HH:mm');

    await page.click('button[name="leftdrawerBtn"]');
    await page.locator('[data-test=create-quest-link]').click();
    await expect(page).toHaveURL(/\/quest\/create$/);

    await page.fill('input[name="quest-title"]', mockQuest.name!);
    await page.locator('[data-test="description-editor"] .q-editor__content').fill(mockQuest.description!);

    await page.fill('[data-test=start-input]', `${startDate} ${startTime}`);
    await page.fill('[data-test=end-input]', `${endDate} ${endTime}`);
    // Select the "Continuous" radio button
    await page.getByLabel('Continuous').check();
    await page.fill('input[name="quest-handle"]', mockQuest.handle!);
    await page.click('[data-test="create-quest-btn"]');
    await expect(
      page.getByRole('alert').filter({ hasText: 'Quest was updated successfully' })
    ).toBeVisible();
    await expect(page).toHaveURL(/\/quest\/\d+\/edit$/, { timeout: 10000 });
  });
  test('Create first node', async ({ page }) => {
    await page.goto('http://localhost:8080/quest/1/edit');
    await page.fill('input[name="node-title"]', firstNode.title!);
    await page.locator('[data-test="node-description-editor"] .q-editor__content').fill(firstNode.description!);
    await page.click('[data-test="node-type-selector"]');
    await page.click('div.q-item[role="option"] >> text=question');
    await expect(page.locator('[data-test="node-type-selector"]')).toContainText('question');
    await page.click('[data-test="node-status-selector"]')
    await page.click('div.q-item[role="option"] >> text=published');
    await expect(page.locator('[data-test="node-status-selector"]')).toContainText('published');
    await page.click('[data-test="add-node-btn"]');
  });
});
