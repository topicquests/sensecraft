import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  guildCreator2,
  player6,
  player7,
  player8,
  player9,
  player10,
  firstNode,
  guildCreator2QuestConv,
  player6Conv,
  player7Conv,
  player8Conv,
  player9Conv,
  player10Conv,
} from '../utilities/StoreMocks';
import { signInPage } from '../utilities/utility';

/**
 * Guild 2 players build a conversation tree within their guild.
 * All guild_draft nodes are visible to all guild 2 members, so players
 * can respond to each other's nodes.
 *
 * Tree structure:
 *   Root question
 *   └── guildCreator2: question  (child of root)
 *       ├── player6:   answer     (Philosopher)
 *       ├── player7:   con_answer (Critic)
 *       ├── player8:   reference  (Researcher)
 *       │   └── player10: reference (Researcher, second reference node)
 *       └── player9:   answer     (Scribe)
 *
 * Status: guild_draft
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

test.describe('Guild 2 quest conversations', () => {
  test('GuildCreator2 adds question node as Game leader', async ({ page }) => {
    await signInPage(guildCreator2, page);
    await addNodeToParent(page, firstNode.title!, guildCreator2QuestConv.title, guildCreator2QuestConv.conv, 'question');
  });

  test('Player6 adds answer node as Philosopher', async ({ page }) => {
    await signInPage(player6, page);
    await addNodeToParent(page, guildCreator2QuestConv.title, player6Conv.title, player6Conv.conv, 'answer');
  });

  test('Player7 adds con_answer node as Critic', async ({ page }) => {
    await signInPage(player7, page);
    await addNodeToParent(page, guildCreator2QuestConv.title, player7Conv.title, player7Conv.conv, 'con_answer');
  });

  test('Player8 adds reference node as Researcher', async ({ page }) => {
    await signInPage(player8, page);
    await addNodeToParent(page, guildCreator2QuestConv.title, player8Conv.title, player8Conv.conv, 'reference');
  });

  test('Player9 adds answer node as Scribe', async ({ page }) => {
    await signInPage(player9, page);
    await addNodeToParent(page, guildCreator2QuestConv.title, player9Conv.title, player9Conv.conv, 'answer');
  });

  test('Player10 adds question node under Player8 reference as Researcher', async ({ page }) => {
    await signInPage(player10, page);
    await addNodeToParent(page, player8Conv.title, player10Conv.title, player10Conv.conv, 'question');
  });
});
