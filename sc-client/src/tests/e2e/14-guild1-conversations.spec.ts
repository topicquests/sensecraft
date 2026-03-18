import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  guildCreator1,
  player1,
  player2,
  player3,
  player4,
  player5,
  firstNode,
  guildCreator1QuestConv,
  player1Conv,
  player2Conv,
  player3Conv,
  player4Conv,
  player5Conv,
} from '../utilities/StoreMocks';
import { signInPage } from '../utilities/utility';

/**
 * Guild 1 players build a conversation tree within their guild.
 * All guild_draft nodes are visible to all guild 1 members, so players
 * can respond to each other's nodes.
 *
 * Tree structure:
 *   Root question
 *   └── guildCreator1: question  (child of root)
 *       ├── player1:   answer     (Philosopher)
 *       ├── player2:   con_answer (Critic)
 *       ├── player3:   reference  (Researcher)
 *       │   └── player5: reference (Researcher, second reference node)
 *       └── player4:   answer     (Scribe)
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

test.describe('Guild 1 quest conversations', () => {
  test('GuildCreator1 adds question node as Game leader', async ({ page }) => {
    await signInPage(guildCreator1, page);
    await addNodeToParent(page, firstNode.title!, guildCreator1QuestConv.title, guildCreator1QuestConv.conv, 'question');
  });

  test('Player1 adds answer node as Philosopher', async ({ page }) => {
    await signInPage(player1, page);
    await addNodeToParent(page, guildCreator1QuestConv.title, player1Conv.title, player1Conv.conv, 'answer');
  });

  test('Player2 adds con_answer node as Critic', async ({ page }) => {
    await signInPage(player2, page);
    await addNodeToParent(page, guildCreator1QuestConv.title, player2Conv.title, player2Conv.conv, 'con_answer');
  });

  test('Player3 adds reference node as Researcher', async ({ page }) => {
    await signInPage(player3, page);
    await addNodeToParent(page, guildCreator1QuestConv.title, player3Conv.title, player3Conv.conv, 'reference');
  });

  test('Player4 adds answer node as Scribe', async ({ page }) => {
    await signInPage(player4, page);
    await addNodeToParent(page, guildCreator1QuestConv.title, player4Conv.title, player4Conv.conv, 'answer');
  });

  test('Player5 adds question node under Player3 reference as Researcher', async ({ page }) => {
    await signInPage(player5, page);
    await addNodeToParent(page, player3Conv.title, player5Conv.title, player5Conv.conv, 'question');
  });
});
