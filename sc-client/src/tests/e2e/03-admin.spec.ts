import { test, expect } from '@playwright/test';
import { admin, guildCreator, questCreator } from '../mocks/StoreMocks';

test.describe('Admin Permission Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/signin');
    await page.fill('input[name="email"]', admin.email!);
    await page.fill('input[name="pass"]', admin.password!);
    await page.click('button[name="loginBtn"]');
    await page.click('button[name="dashboardInstruction"]');
  });

  test('Admin can assign createQuest permission to another member', async ({ page }) => {
    await page.click('button[name="leftdrawerBtn"]');
    await page.getByText('Administration').click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.locator('#qselect').click();
    await page.locator('.q-menu').getByText(questCreator.handle!).click();
    await page.getByTestId('checkbox-createQuest').click();
    await page.getByRole('button', { name: 'Update', exact: true  }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'Permissions were updated' })
    ).toBeVisible();
  });
  test('Admin can assign createGuild permission to another member', async ({ page }) => {
    await page.click('button[name="leftdrawerBtn"]');
    await page.getByText('Administration').click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.locator('#qselect').click();
    await page.locator('.q-menu').getByText(guildCreator.handle!).click();
    await page.getByTestId('checkbox-createGuild').click();
    await page.getByRole('button', { name: 'Update', exact: true  }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'Permissions were updated' })
    ).toBeVisible();
  });
});
