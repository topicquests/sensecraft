import { test } from '@playwright/test';
import {
  guildCreator2,
  guildCreator2QuestConv,
  player6Conv,
  player7Conv,
  player8Conv,
  player9Conv,
  player10Conv,
} from '../utilities/StoreMocks';
import { signInPage, submitNodeByTitle } from '../utilities/utility';

/**
 * The game leader submits all guild_draft nodes for guild 2.
 * Nodes were created during registration; submission requires ongoing status.
 * For a continuous quest, submitted nodes are automatically published.
 */
test.describe('Guild 2 game leader submits conversation nodes', () => {
  test('GuildCreator2 submits all guild 2 nodes', async ({ page }) => {
    await signInPage(guildCreator2, page);
    await page.goto('http://localhost:9090/quest/1');

    await submitNodeByTitle(page, guildCreator2QuestConv.title);
    await submitNodeByTitle(page, player6Conv.title);
    await submitNodeByTitle(page, player7Conv.title);
    await submitNodeByTitle(page, player8Conv.title);
    await submitNodeByTitle(page, player9Conv.title);
    await submitNodeByTitle(page, player10Conv.title);
  });
});
