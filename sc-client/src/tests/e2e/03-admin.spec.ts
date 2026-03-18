import { test, expect, Page } from '@playwright/test';
import {
  admin,
  questCreator,
  guildCreator1,
  guildCreator2,
} from '../utilities/StoreMocks';

/**
 * --------------------
 * Selectors
 * --------------------
 */
const selectors = {
  email: 'input[name="email"]',
  password: 'input[name="pass"]',
  loginBtn: 'button[name="loginBtn"]',
  dashboardInstruction: 'button[name="dashboardInstruction"]',
  drawerBtn: 'button[name="leftdrawerBtn"]',
  adminNav: 'text=Administration',

  memberSelect: '[data-testid="member-select"]',
  createQuest: '[data-testid="checkbox-createQuest"]',
  createGuild: '[data-testid="checkbox-createGuild"]',
  updateBtn: '[data-testid="permissions-update"]',

  notification: '.q-notification',
};

/**
 * --------------------
 * Helpers
 * --------------------
 */
async function loginAsAdmin(page: Page) {
  await page.goto('http://localhost:9090/signin');
  await page.fill(selectors.email, admin.email!);
  await page.fill(selectors.password, admin.password!);
  await page.click(selectors.loginBtn);
  await page.click(selectors.dashboardInstruction);
}

async function goToAdminPage(page: Page) {
  await page.click(selectors.drawerBtn);
  await page.click(selectors.adminNav);
  await expect(page).toHaveURL(/\/admin$/);
}

async function selectMember(page: Page, handle: string) {
  await page.getByTestId('member-select').click();
  await page.locator('.q-menu').getByText(handle, { exact: true }).click();
}

async function expectPermissionsUpdated(page: Page) {
  await expect(
    page.locator(selectors.notification).filter({
      hasText: /permissions updated successfully/i,
    }),
  ).toBeVisible();
}

/**
 * --------------------
 * Tests
 * --------------------
 */
test.describe('Admin Permission Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminPage(page);
  });

  test('Admin assigns createQuest permission to questCreator', async ({
    page,
  }) => {
    await selectMember(page, questCreator.handle!);

    await page.getByTestId('checkbox-createQuest').check();
    await page.getByTestId('permissions-update').click();

    await expectPermissionsUpdated(page);
  });

  test('Admin assigns createGuild permission to guildCreator1', async ({
    page,
  }) => {
    await selectMember(page, guildCreator1.handle!);

    await page.getByTestId('checkbox-createGuild').check();
    await page.getByTestId('permissions-update').click();

    await expectPermissionsUpdated(page);
  });

  test('Admin assigns createGuild permission to guildCreator2', async ({
    page,
  }) => {
    await selectMember(page, guildCreator2.handle!);

    await page.getByTestId('checkbox-createGuild').check();
    await page.getByTestId('permissions-update').click();

    await expectPermissionsUpdated(page);
  });
});
