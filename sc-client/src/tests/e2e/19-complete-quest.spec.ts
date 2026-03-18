import { test, expect } from '@playwright/test';
import { questCreator, mockQuest } from '../utilities/StoreMocks';
import { signInPage } from '../utilities/utility';

/**
 * Quest creator marks the quest as Finished after both guilds have published.
 * For a continuous quest, nodes are auto-published on submission so no end-turn is needed.
 * For a turn-based quest, the End Turn button at /quest/:id/edit must be clicked first.
 */
test.describe('Complete quest', () => {
  test('QuestCreator marks quest as Finished after both guilds have published', async ({ page }) => {
    await signInPage(questCreator, page);
    await page.goto('http://localhost:9090/quest/1/edit');

    await page.getByRole('button', { name: 'Finished' }).click();
    await page.click('[data-test="update-quest-btn"]');

    await expect(
      page.getByRole('alert').filter({ hasText: 'Quest was updated successfully' }),
    ).toBeVisible();
    await expect(page.locator('text=Current: finished')).toBeVisible();
  });
});
