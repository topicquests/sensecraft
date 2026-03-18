import { test } from '@playwright/test';
import {
  guildCreator1,
  guildCreator1QuestConv,
  player1Conv,
  player2Conv,
  player3Conv,
  player4Conv,
  player5Conv,
} from '../utilities/StoreMocks';
import { signInPage, submitNodeByTitle } from '../utilities/utility';

/**
 * The game leader submits all guild_draft nodes for guild 1.
 * Nodes were created during registration; submission requires ongoing status.
 * For a continuous quest, submitted nodes are automatically published.
 */
test.describe('Guild 1 game leader submits conversation nodes', () => {
  test('GuildCreator1 submits all guild 1 nodes', async ({ page }) => {
    await signInPage(guildCreator1, page);
    await page.goto('http://localhost:9090/quest/1');

    await submitNodeByTitle(page, guildCreator1QuestConv.title);
    await submitNodeByTitle(page, player1Conv.title);
    await submitNodeByTitle(page, player2Conv.title);
    await submitNodeByTitle(page, player3Conv.title);
    await submitNodeByTitle(page, player4Conv.title);
    await submitNodeByTitle(page, player5Conv.title);
  });
});
