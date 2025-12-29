import { test, expect } from '@playwright/test';
import {
  guild1,
  guild2,
  guildCreator1,
  guildCreator2,
} from '../utilities/StoreMocks';

test.describe('Guild creator Permission Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/signin');
  });

  test('Guild creator can go to create guild page', async ({ page }) => {
    await page.fill('input[name="email"]', guildCreator1.email!);
    await page.fill('input[name="pass"]', guildCreator1.password!);
    await page.click('button[name="loginBtn"]');
    await page.click('button[name="dashboardInstruction"]');
    await page.click('button[name="leftdrawerBtn"]');
    await page.locator('[data-test=create-guild-link]').click();
    await expect(page).toHaveURL(/\/guild\/create$/);
  });
  test('Guild creator create guild 1', async ({ page }) => {
    await page.fill('input[name="email"]', guildCreator1.email!);
    await page.fill('input[name="pass"]', guildCreator1.password!);
    await page.click('button[name="loginBtn"]');
    await page.click('button[name="dashboardInstruction"]');
    await page.click('button[name="leftdrawerBtn"]');
    await page.locator('[data-test=create-guild-link]').click();
    await expect(page).toHaveURL(/\/guild\/create$/);
    await page.getByText('Public').click();

    await page.fill('input[name="guild-title"]', guild1.name!);
    await page
      .locator('[data-test="guild-description-editor"] .q-editor__content')
      .fill(guild1.description!);
    await page.locator('.q-select .q-field__control').click();
    await page.locator('.q-menu').waitFor();
    await page.locator('.q-menu').getByText('Researcher').click();

    await page.fill('input[name="guild-handle"]', guild1.handle!);
    await page.click('button[name="create-guild-btn"]');
    await expect(
      page.getByRole('alert').filter({ hasText: 'Added new guild' }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/guild\/\d+\/admin/, { timeout: 10000 });
  });
  test('Guild creator create guild 2', async ({ page }) => {
    await page.fill('input[name="email"]', guildCreator2.email!);
    await page.fill('input[name="pass"]', guildCreator2.password!);
    await page.click('button[name="loginBtn"]');
    await page.click('button[name="dashboardInstruction"]');
    await page.click('button[name="leftdrawerBtn"]');
    await page.locator('[data-test=create-guild-link]').click();
    await expect(page).toHaveURL(/\/guild\/create$/);
    await page.getByText('Public').click();
    await page.fill('input[name="guild-title"]', guild2.name!);
    await page
      .locator('[data-test="guild-description-editor"] .q-editor__content')
      .fill(guild2.description!);
    await page.locator('.q-select .q-field__control').click();
    await page.locator('.q-menu').waitFor();
    await page.locator('.q-menu').getByText('Researcher').click();
    await page.fill('input[name="guild-handle"]', guild2.handle!);
    await page.click('button[name="create-guild-btn"]');
    await expect(
      page.getByRole('alert').filter({ hasText: 'Added new guild' }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/guild\/\d+\/admin/, { timeout: 10000 });
  });
});
