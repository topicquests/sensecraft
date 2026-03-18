import { test, expect } from '@playwright/test';
import { questCreator } from '../utilities/StoreMocks';
import { signInPage } from '../utilities/utility';

test.describe('Set quest to ongoing', () => {
  test('QuestCreator sets quest status to ongoing', async ({ page }) => {
    await signInPage(questCreator, page);
    await page.goto('http://localhost:9090/quest/1/edit');

    await page.getByRole('button', { name: 'Ongoing' }).click();
    await page.click('[data-test="update-quest-btn"]');

    await expect(
      page.getByRole('alert').filter({ hasText: 'Quest was updated successfully' }),
    ).toBeVisible();
    await expect(page.locator('text=Current: ongoing')).toBeVisible();
  });
});
