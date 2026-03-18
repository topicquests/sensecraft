import { test, expect } from '@playwright/test';
import { firstNode, questCreator } from '../utilities/StoreMocks';
import { signInPage } from '../utilities/utility';

test.describe('Quest Edit & Node Flow (Quest Creator)', () => {
  test.beforeEach(async ({ page }) => {
    await signInPage(questCreator, page);
    await page.click('button[name="dashboardInstruction"]');
  });
  test("register to quest", async({page}) => {
    await page.goto('http://localhost:9090/quest/1/edit');

    await page.click('[data-test="registration-btn"]')
    await page.click('[data-test="update-quest-btn"]')
    await expect(
      page.getByRole('alert').filter({ 
        hasText: 'Quest was updated successfully' 
      }),
    ).toBeVisible();
    
  })
  test('Quest creator can create first conversation node', async ({ page }) => {
    await page.goto('http://localhost:9090/quest/1/edit');
    await page.waitForSelector('[data-test="node-title-input"]');

    await page
      .locator('[data-test="node-title-input"]')
      .fill(firstNode.title!);

    await page
      .locator('[data-test="node-description-editor"] .q-editor__content')
      .fill(firstNode.description!);

    // Node type selector
    await page.click('[data-test="node-type-selector"]');
    const typeMenu = page.locator('.q-menu').filter({ hasText: 'question' });
    await expect(typeMenu).toBeVisible();
    await typeMenu.getByRole('option', { name: 'question' }).click();

    await expect(
      page.locator('[data-test="node-type-selector"]'),
    ).toContainText('question');

    // Status selector
    await page.click('[data-test="node-status-selector"]');
    const statusMenu = page.locator('.q-menu').filter({ hasText: 'published' });
    await expect(statusMenu).toBeVisible();
    await statusMenu.getByRole('option', { name: 'published' }).click();

    await expect(
      page.locator('[data-test="node-status-selector"]'),
    ).toContainText('published');

    // Submit node
    await page.click('[data-test="add-node-btn"]');

    await expect(
      page.getByRole('alert').filter({
        hasText: 'Added node to conversation',
      }),
    ).toBeVisible();
  });

  test('Quest creator can update existing root node', async ({ page }) => {
    await page.goto('http://localhost:9090/quest/1/edit');

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
