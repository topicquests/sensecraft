import { test, expect } from '@playwright/test';
import { gotoGuildPage, signInPage } from '../utilities/utility';
import {
  guild1,
  guildCreator1,
  guildCreator1Conv,
} from '../utilities/StoreMocks';

test.describe('Guild 1 conversation', () => {
  test('GuildCreator1 creates and navigates to a new guild channel', async ({
    page,
  }) => {
    await signInPage(guildCreator1, page);
    await gotoGuildPage(guild1, 'View', page);

    // Open right drawer and go to guild channel list
    await page.click('button[name="rightdrawerBtn"]');
    await page.getByRole('link', { name: 'Guild Channels' }).click();

    // Should be on /guild/:id/channel
    await expect(page).toHaveURL(/\/guild\/\d+\/channel$/);

    // Click create button
    await page.click('[data-test="create-guild-channel-Btn"]');

    // Fill in new channel title
    await page.fill('input[name="new-channel-title"]', guildCreator1Conv.title);

    // Confirm creation
    await page.click('button[name="confirm-guild-conversation-btn"]');

    // Expect success toast
    await expect(
      page
        .getByRole('alert')
        .filter({ hasText: 'Added new conversation node' }),
    ).toBeVisible();

    // Click the channel link that appears in the page (inPage = true)
    await expect(
      page.getByRole('link', { name: guildCreator1Conv.title }).first(),
    ).toBeVisible();
    await page
      .getByRole('link', { name: guildCreator1Conv.title })
      .first()
      .click();

    // Should navigate to new guild channel conversation
    await expect(page).toHaveURL(/\/guild\/\d+\/channel\/\d+$/);
  });
});
