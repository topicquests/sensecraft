import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  guildCreator2,
  player6,
  player7,
  player8,
  player9,
  player10,
  guildCreator1QuestConv,
  guildCreator2Response,
  player6Response,
  player7Response,
  player8Response,
  player9Response,
  player10Response,
} from '../utilities/StoreMocks';
import { signInPage } from '../utilities/utility';

/**
 * Guild 2 responds to Guild 1's published nodes.
 * This happens after both guilds have submitted their guild_draft trees
 * and continuous-quest auto-publication has made them visible to all.
 *
 * Tree structure (guild 2 responses):
 *   guildCreator1's question
 *   └── guildCreator2Response: question   (cross-guild question)
 *       ├── player6Response:   answer     (Philosopher)
 *       ├── player7Response:   con_answer (Critic)
 *       ├── player8Response:   con_answer (Researcher)
 *       ├── player9Response:   answer     (Scribe)
 *       └── player10Response:  con_answer (Researcher)
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

test.describe('Guild 2 responds to Guild 1 published nodes', () => {
  test('GuildCreator2 adds question under Guild 1 question as Game leader', async ({ page }) => {
    await signInPage(guildCreator2, page);
    await addNodeToParent(page, guildCreator1QuestConv.title, guildCreator2Response.title, guildCreator2Response.conv, 'question');
  });

  test('Player6 adds answer under GuildCreator2 response as Philosopher', async ({ page }) => {
    await signInPage(player6, page);
    await addNodeToParent(page, guildCreator2Response.title, player6Response.title, player6Response.conv, 'answer');
  });

  test('Player7 adds con_answer under GuildCreator2 response as Critic', async ({ page }) => {
    await signInPage(player7, page);
    await addNodeToParent(page, guildCreator2Response.title, player7Response.title, player7Response.conv, 'con_answer');
  });

  test('Player8 adds con_answer under GuildCreator2 response as Researcher', async ({ page }) => {
    await signInPage(player8, page);
    await addNodeToParent(page, guildCreator2Response.title, player8Response.title, player8Response.conv, 'con_answer');
  });

  test('Player9 adds answer under GuildCreator2 response as Scribe', async ({ page }) => {
    await signInPage(player9, page);
    await addNodeToParent(page, guildCreator2Response.title, player9Response.title, player9Response.conv, 'answer');
  });

  test('Player10 adds con_answer under GuildCreator2 response as Researcher', async ({ page }) => {
    await signInPage(player10, page);
    await addNodeToParent(page, guildCreator2Response.title, player10Response.title, player10Response.conv, 'con_answer');
  });
});
