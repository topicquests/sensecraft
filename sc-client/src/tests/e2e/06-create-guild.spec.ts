import { test, expect } from '@playwright/test';
import {
  guild1,
  guild2,
  guildCreator1,
  guildCreator2,
} from '../utilities/StoreMocks';
import { signInPage } from '../utilities/utility';

test.describe('Guild creator Permission Flow', () => {
  test('Guild creator can go to create guild page', async ({ page }) => {
    await signInPage(guildCreator1, page);
    await page.click('button[name="dashboardInstruction"]');
    await page.click('button[name="leftdrawerBtn"]');
    await page.locator('[data-test=create-guild-link]').click();
    await expect(page).toHaveURL(/\/guild\/create$/);
  });
  test('Guild creator create guild 1', async ({ page }) => {
    await signInPage(guildCreator1, page);
    await page.click('button[name="dashboardInstruction"]');
    await page.click('button[name="leftdrawerBtn"]');
    await page.locator('[data-test=create-guild-link]').click();
    await expect(page).toHaveURL(/\/guild\/create$/);
    await page.getByText('Public').click();

    await page.
      locator('[data-test="guild-title-input"]')
      .fill(guild1.name!);
    await page
      .locator('[data-test="guild-description-editor"] .q-editor__content')
      .fill(guild1.name!);

    await page
      .locator('[data-test="guild-description-editor"] .q-editor__content')
      .fill(guild1.description!);

    await page.click('[data-test="default-role-selector"]');
      const menu = page.locator('[id^="q-portal--menu"] .q-menu');
    await expect(menu).toBeVisible();

    await menu.getByRole('option', { name: 'Researcher' }).click();
    await expect(
      page.locator('[data-test="default-role-selector"]')
    ).toContainText('Researcher');

    
    await page.locator('[data-test="guild-handle"]')
      .fill(guild1.handle!);

    await page.click('[data-test="add-guild-btn"]');

    await expect(
      page.getByRole('alert').filter({ 
        hasText: 'Guild created successfully!' 
      }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/guild\/\d+\/admin/, { timeout: 10000 });
  });
  test('Guild creator create guild 2', async ({ page }) => {
    await signInPage(guildCreator2, page);
    await page.click('button[name="dashboardInstruction"]');
    await page.click('button[name="leftdrawerBtn"]');
    await page.locator('[data-test=create-guild-link]').click();
    await expect(page).toHaveURL(/\/guild\/create$/);
    await page.getByText('Public').click();

    await page.
      locator('[data-test="guild-title-input"]')
      .fill(guild2.name!);
    await page
      .locator('[data-test="guild-description-editor"] .q-editor__content')
      .fill(guild2.name!);

    await page
      .locator('[data-test="guild-description-editor"] .q-editor__content')
      .fill(guild2.description!);

    await page.click('[data-test="default-role-selector"]');
      const menu = page.locator('[id^="q-portal--menu"] .q-menu');
    await expect(menu).toBeVisible();

    await menu.getByRole('option', { name: 'Researcher' }).click();
    await expect(
      page.locator('[data-test="default-role-selector"]')
    ).toContainText('Researcher');

    
    await page.locator('[data-test="guild-handle"]')
      .fill(guild2.handle!);

    await page.click('[data-test="add-guild-btn"]');

    await expect(
      page.getByRole('alert').filter({ 
        hasText: 'Guild created successfully!' 
      }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/guild\/\d+\/admin/, { timeout: 10000 });
  });
});


