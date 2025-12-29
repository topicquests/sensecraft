import { test, expect } from '@playwright/test';
import { firstNode, questCreator } from '../utilities/StoreMocks';
import { signInPage } from '../utilities/utility';

test.describe('Quest Edit & Node Flow (Quest Creator)', () => {
  test.beforeEach(async ({ page }) => {
    await signInPage(questCreator, page);
    await page.click('button[name="dashboardInstruction"]');
  });
  test('Quest creator can create first conversation node', async ({ page }) => {
    // NOTE: replace with dynamic ID if you later seed quests
    await page.goto('http://localhost:8080/quest/1/edit');

    // wait for node form to exist (prevents race conditions)
    await page.waitForSelector('[data-test="node-title-input"]');

    await page
      .locator('[data-test="node-title-input"]')
      .fill(firstNode.title!);

    await page
      .locator('[data-test="node-description-editor"] .q-editor__content')
      .fill(firstNode.description!);

    // Node type selector
    await page.click('[data-test="node-type-selector"]');
    const menu = page.locator('.q-menu');
    await expect(menu).toBeVisible();
    await menu.getByRole('option', { name: 'question' }).click();

    await expect(
      page.locator('[data-test="node-type-selector"]'),
    ).toContainText('question');

    // Status selector
    await page.click('[data-test="node-status-selector"]');
    await expect(menu).toBeVisible();
    await menu.getByRole('option', { name: 'published' }).click();

    await expect(
      page.locator('[data-test="node-status-selector"]'),
    ).toContainText('published');

    // Submit node
    await page.click('[data-test="update-node-btn"]');

    await expect(
      page.getByRole('alert').filter({
        hasText: 'Root node updated',
      }),
    ).toBeVisible();
  });

  test('Quest creator can update existing root node', async ({ page }) => {
    await page.goto('http://localhost:8080/quest/1/edit');

    await page.waitForSelector('[data-test="node-title-input"]');

    await page
      .locator('[data-test="node-title-input"]')
      .fill('Updated Root Question');

    await page.click('[data-test="update-node-btn"]');
    await expect(
      page.getByRole('alert').filter({
        hasText: 'Root node updated',
      }),
    ).toBeVisible();
  });
});
