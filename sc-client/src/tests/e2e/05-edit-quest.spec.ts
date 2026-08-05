import { test, expect } from '@playwright/test';
import { firstNode, questCreator, admin } from '../utilities/StoreMocks';
import { signInPage } from '../utilities/utility';

test.describe('Quest Edit & Node Flow (Quest Creator)', () => {
  test.beforeEach(async ({ page }) => {
    await signInPage(questCreator, page);
    await page.click('button[name="dashboardInstruction"]');
  });
  test('Quest creator can create first conversation node', async ({ page }) => {
    await page.goto('http://localhost:9090/quest/1/edit');
    await page.waitForSelector('[data-test="node-title-input"]');

    await page
      .locator('[data-test="node-title-input"]')
      .fill(firstNode.title!);

    await page
      .locator('[data-test="node-description-editor"] .q-editor__content')
      .fill(firstNode.description!);

    // Type & status selectors are hidden for the root node: it is always
    // created as a "question" with "published" status.
    await expect(
      page.locator('[data-test="node-type-selector"]'),
    ).not.toBeVisible();
    await expect(
      page.locator('[data-test="node-status-selector"]'),
    ).not.toBeVisible();

    // Submit node
    await page.click('[data-test="add-node-btn"]');

    await expect(
      page.getByRole('alert').filter({
        hasText: 'Added node to conversation',
      }),
    ).toBeVisible();
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

  test('Quest creator cannot update the root node once it is published', async ({
    page,
  }) => {
    // Published nodes are immutable to everyone except a superadmin.
    await page.goto('http://localhost:9090/quest/1/edit');

    await page.waitForSelector('[data-test="node-title-input"]');

    await page
      .locator('[data-test="node-title-input"]')
      .fill('Updated Root Question');

    await page.click('[data-test="update-node-btn"]');
    await expect(
      page.getByRole('alert').filter({
        hasText: 'There was an error adding root node',
      }),
    ).toBeVisible();
  });

  test('Superadmin can still update the root node once it is published', async ({
    page,
  }) => {
    await signInPage(admin, page);
    await page.click('button[name="dashboardInstruction"]');

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
