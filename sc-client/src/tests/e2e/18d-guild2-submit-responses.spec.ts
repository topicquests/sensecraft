import { test } from '@playwright/test';
import {
  guildCreator2,
  guildCreator2Response,
  player6Response,
  player7Response,
  player8Response,
  player9Response,
  player10Response,
} from '../utilities/StoreMocks';
import { signInPage, submitNodeByTitle } from '../utilities/utility';

/**
 * Guild 2 game leader submits the cross-guild response nodes created in 18b.
 * For a continuous quest, submitted nodes are automatically published.
 */
test.describe('Guild 2 game leader submits cross-guild response nodes', () => {
  test('GuildCreator2 submits all guild 2 response nodes', async ({ page }) => {
    await signInPage(guildCreator2, page);
    await page.goto('http://localhost:9090/quest/1');

    await submitNodeByTitle(page, guildCreator2Response.title);
    await submitNodeByTitle(page, player6Response.title);
    await submitNodeByTitle(page, player7Response.title);
    await submitNodeByTitle(page, player8Response.title);
    await submitNodeByTitle(page, player9Response.title);
    await submitNodeByTitle(page, player10Response.title);
  });
});
