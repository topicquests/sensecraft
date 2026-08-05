import { test, expect } from '@playwright/test';
import {
  player1,
  player2,
  player3,
  player4,
  player5,
} from '../utilities/StoreMocks';
import { dismissDashboardInstruction, joinGuildIfNotMember } from '../utilities/utility';

async function joinBlackKnights(page: Parameters<typeof dismissDashboardInstruction>[0], email: string, password: string) {
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="pass"]', password);
  await page.click('button[name="loginBtn"]');
  await expect(page).toHaveURL(/.*lobby/);

  await dismissDashboardInstruction(page);

  const row = page.locator('.guilds-table tbody tr', {
    has: page.locator('td', { hasText: 'Black Knights' }),
  });
  await expect(row).toBeVisible();
  const viewLink = row.locator('a', { hasText: 'View' });
  await expect(viewLink).toBeVisible();
  await viewLink.click();
  await expect(page).toHaveURL(/.*guild\/\d+/);
  await expect(page.locator('.guild-page')).toBeVisible();

  await joinGuildIfNotMember(page);
}

test.describe('Add players to guild one', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9090/signin');
  });

  test('add player one to guild 1', async ({ page }) => {
    await joinBlackKnights(page, player1.email!, player1.password!);
  });

  test('add player two to guild 1', async ({ page }) => {
    await joinBlackKnights(page, player2.email!, player2.password!);
  });

  test('add player three to guild 1', async ({ page }) => {
    await joinBlackKnights(page, player3.email!, player3.password!);
  });

  test('add player four to guild 1', async ({ page }) => {
    await joinBlackKnights(page, player4.email!, player4.password!);
  });

  test('add player five to guild 1', async ({ page }) => {
    await joinBlackKnights(page, player5.email!, player5.password!);
  });

  test('player one no longer sees a Join button after already joining guild 1', async ({
    page,
  }) => {
    await page.fill('input[name="email"]', player1.email!);
    await page.fill('input[name="pass"]', player1.password!);
    await page.click('button[name="loginBtn"]');
    await expect(page).toHaveURL(/.*lobby/);

    await dismissDashboardInstruction(page);

    const row = page.locator('.guilds-table tbody tr', {
      has: page.locator('td', { hasText: 'Black Knights' }),
    });
    await expect(row).toBeVisible();
    const viewLink = row.locator('a', { hasText: 'View' });
    await viewLink.click();
    await expect(page).toHaveURL(/.*guild\/\d+/);
    await expect(page.locator('.guild-page')).toBeVisible();

    await expect(page.locator('button', { hasText: 'Join' })).toBeHidden();
  });
});
