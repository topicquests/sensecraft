import { test } from '@playwright/test';
import {
  guildCreator1,
  guildCreator1Response,
  player1Response,
  player2Response,
  player3Response,
  player4Response,
  player5Response,
} from '../utilities/StoreMocks';
import { signInPage, submitNodeByTitle } from '../utilities/utility';

/**
 * Guild 1 game leader submits the cross-guild response nodes created in 18a.
 * For a continuous quest, submitted nodes are automatically published.
 */
test.describe('Guild 1 game leader submits cross-guild response nodes', () => {
  test('GuildCreator1 submits all guild 1 response nodes', async ({ page }) => {
    await signInPage(guildCreator1, page);
    await page.goto('http://localhost:9090/quest/1');

    await submitNodeByTitle(page, guildCreator1Response.title);
    await submitNodeByTitle(page, player1Response.title);
    await submitNodeByTitle(page, player2Response.title);
    await submitNodeByTitle(page, player3Response.title);
    await submitNodeByTitle(page, player4Response.title);
    await submitNodeByTitle(page, player5Response.title);
  });
});
