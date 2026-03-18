import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  guildCreator1,
  player1,
  player2,
  player3,
  player4,
  player5,
  guildCreator2QuestConv,
  guildCreator1Response,
  player1Response,
  player2Response,
  player3Response,
  player4Response,
  player5Response,
} from '../utilities/StoreMocks';
import { signInPage } from '../utilities/utility';

/**
 * Guild 1 responds to Guild 2's published nodes.
 * This happens after both guilds have submitted their guild_draft trees
 * and continuous-quest auto-publication has made them visible to all.
 *
 * Tree structure (guild 1 responses):
 *   guildCreator2's question
 *   └── guildCreator1Response: question   (cross-guild question)
 *       ├── player1Response:   answer     (Philosopher)
 *       ├── player2Response:   con_answer (Critic)
 *       ├── player3Response:   con_answer (Researcher)
 *       ├── player4Response:   answer     (Scribe)
 *       └── player5Response:   con_answer (Researcher)
 */

async function addNodeToParent(
  page: Page,
  parentTitle: string,
  title: string,
  conv: string,
  nodeType: string,
) {
  await page.goto('http://localhost:9090/quest/1');

  const parentHeader = page.locator('.q-tree__node-header').filter({ hasText: parentTitle });
  await parentHeader.locator('button:has(i.material-icons:text-is("add"))').click();
  await page.waitForSelector('[data-test="node-title-input"]');

  await page.locator('[data-test="node-title-input"]').fill(title);
  await page
    .locator('[data-test="node-description-editor"] .q-editor__content')
    .fill(conv);

  // 'question' appears in every type menu but never in a status menu
  await page.click('[data-test="node-type-selector"]');
  const typeMenu = page.locator('.q-menu').filter({ hasText: 'question' });
  await expect(typeMenu).toBeVisible();
  await typeMenu.getByRole('option', { name: nodeType, exact: true }).click();

  await page.click('[data-test="node-status-selector"]');
  const statusMenu = page.locator('.q-menu').filter({ hasText: 'guild_draft' });
  await expect(statusMenu).toBeVisible();
  await statusMenu.getByRole('option', { name: 'guild_draft', exact: true }).click();

  await page.click('[data-test="add-node-btn"]');
  await expect(
    page.getByRole('alert').filter({ hasText: 'Node added successfuly' }),
  ).toBeVisible();
}

test.describe('Guild 1 responds to Guild 2 published nodes', () => {
  test('GuildCreator1 adds question under Guild 2 question as Game leader', async ({ page }) => {
    await signInPage(guildCreator1, page);
    await addNodeToParent(page, guildCreator2QuestConv.title, guildCreator1Response.title, guildCreator1Response.conv, 'question');
  });

  test('Player1 adds answer under GuildCreator1 response as Philosopher', async ({ page }) => {
    await signInPage(player1, page);
    await addNodeToParent(page, guildCreator1Response.title, player1Response.title, player1Response.conv, 'answer');
  });

  test('Player2 adds con_answer under GuildCreator1 response as Critic', async ({ page }) => {
    await signInPage(player2, page);
    await addNodeToParent(page, guildCreator1Response.title, player2Response.title, player2Response.conv, 'con_answer');
  });

  test('Player3 adds con_answer under GuildCreator1 response as Researcher', async ({ page }) => {
    await signInPage(player3, page);
    await addNodeToParent(page, guildCreator1Response.title, player3Response.title, player3Response.conv, 'con_answer');
  });

  test('Player4 adds answer under GuildCreator1 response as Scribe', async ({ page }) => {
    await signInPage(player4, page);
    await addNodeToParent(page, guildCreator1Response.title, player4Response.title, player4Response.conv, 'answer');
  });

  test('Player5 adds con_answer under GuildCreator1 response as Researcher', async ({ page }) => {
    await signInPage(player5, page);
    await addNodeToParent(page, guildCreator1Response.title, player5Response.title, player5Response.conv, 'con_answer');
  });
});
