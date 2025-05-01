import { test, expect } from '@playwright/test';
import { guildCreator, mockGuild } from '../mocks/StoreMocks';

test.describe('Guild creator Permission Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/signin');
    await page.fill('input[name="email"]', guildCreator.email!);
    await page.fill('input[name="pass"]', guildCreator.password!);
    await page.click('button[name="loginBtn"]');
    await page.click('button[name="dashboardInstruction"]');
  });

  test('Guild creator can go to create guild page', async ({ page }) => {
    await page.click('button[name="leftdrawerBtn"]');
    await page.locator('[data-test=create-guild-link]').click();
    await expect(page).toHaveURL(/\/guild\/create$/);
  });
  test('Guild creator create guild', async ({ page }) => {
    await page.click('button[name="leftdrawerBtn"]');
    await page.locator('[data-test=create-guild-link]').click();
    await expect(page).toHaveURL(/\/guild\/create$/);

    await page.getByText('Public').click();

    await page.fill('input[name="guild-title"]', mockGuild.name);
    await page.locator('[data-test="guild-description-editor"] .q-editor__content').fill(mockGuild.description!);

    await page.locator('.q-select .q-field__control').click();
    await page.locator('.q-menu').waitFor();
    await page.locator('.q-menu').getByText('Researcher').click();

    await page.fill('input[name="guild-handle"]', mockGuild.handle);

    await page.click('button[name="create-guild-btn"]');
    await expect(
      page.getByRole('alert').filter({ hasText: 'Added new guild' })
    ).toBeVisible();
    await expect(page).toHaveURL(/\/guild\/\d+\/admin/, { timeout: 10000 }); // waits up to 10 seconds

  });
});
