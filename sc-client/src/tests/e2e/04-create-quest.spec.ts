import { test, expect } from '@playwright/test';
import { mockQuest, questCreator, player1 } from '../utilities/StoreMocks';
import { DateTime } from 'luxon';
import { signInPage } from '../utilities/utility';

test.describe('Quest creator Permission Flow', () => {
  test.beforeEach(async ({ page }) => {
    await signInPage(questCreator, page);
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

    await page
      .locator('[data-test="quest-title-input"]')
      .fill(mockQuest.name!);
    await page
      .locator('[data-test="description-editor"] .q-editor__content')
      .fill(mockQuest.description!);
    await page
      .locator('input.start-input')
      .fill(`${startDate} ${startTime}`);
    await page
      .locator('input.end-input')
      .fill(`${endDate} ${endTime}`);
    // Select the "Continuous" radio button
    await page.getByLabel('Continuous').check();
    await page 
      .locator('input.quest-handle-input')
      .fill(mockQuest.handle!);
    // create flow
    await page.click('[data-test="create-quest-btn"]');
    // wait for navigation to the edit page
    await page.waitForURL(/\/quest\/\d+\/edit$/, { timeout: 15000 });
    // edit flow
    await page.click('[data-test="update-quest-btn"]');
    await expect(
      page
        .getByRole('alert')
        .filter({ hasText: 'Quest was updated successfully' }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/quest\/\d+\/edit$/, { timeout: 10000 });
  });
});

test.describe('Quest creation authorization', () => {
  test('member without createQuest permission cannot create a quest', async ({
    page,
  }) => {
    await signInPage(player1, page);
    await page.click('button[name="dashboardInstruction"]');

    await page.goto('http://localhost:9090/quest/create');

    const start = DateTime.now().plus({ days: 1 });
    const end = start.plus({ months: 6 });

    await page
      .locator('[data-test="quest-title-input"]')
      .fill('Unauthorized Quest Attempt');
    await page
      .locator('[data-test="description-editor"] .q-editor__content')
      .fill('This quest should not be created.');
    await page
      .locator('input.start-input')
      .fill(`${start.toFormat('yyyy-MM-dd')} ${start.toFormat('HH:mm')}`);
    await page
      .locator('input.end-input')
      .fill(`${end.toFormat('yyyy-MM-dd')} ${end.toFormat('HH:mm')}`);
    await page.getByLabel('Continuous').check();
    await page
      .locator('input.quest-handle-input')
      .fill('UnauthorizedQuestAttempt');

    await page.click('[data-test="create-quest-btn"]');

    await expect(
      page.getByRole('alert').filter({ hasText: /error updating quest/i }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/quest\/create$/);
  });
});
