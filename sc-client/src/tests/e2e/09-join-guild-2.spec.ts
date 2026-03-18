import { test, expect } from '@playwright/test';
import {
  player6,
  player7,
  player8,
  player9,
  player10,
  guild2,
} from '../utilities/StoreMocks';
import { dismissDashboardInstruction, joinGuildIfNotMember } from '../utilities/utility';

async function joinGuild2(page: Parameters<typeof dismissDashboardInstruction>[0], email: string, password: string) {
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="pass"]', password);
  await page.click('button[name="loginBtn"]');
  await expect(page).toHaveURL(/.*lobby/);

  await dismissDashboardInstruction(page);

  const row = page.locator('.guilds-table tbody tr', {
    has: page.locator('td', { hasText: guild2.name }),
  });
  await expect(row).toBeVisible();
  const viewLink = row.locator('a', { hasText: 'View' });
  await expect(viewLink).toBeVisible();
  await viewLink.click();
  await expect(page).toHaveURL(/.*guild\/\d+/);
  await expect(page.locator('.guild-page')).toBeVisible();

  await joinGuildIfNotMember(page);
}

test.describe('Add players to guild 2', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9090/signin');
  });

  test('add player six to guild 2', async ({ page }) => {
    await joinGuild2(page, player6.email!, player6.password!);
  });

  test('add player seven to guild 2', async ({ page }) => {
    await joinGuild2(page, player7.email!, player7.password!);
  });

  test('add player eight to guild 2', async ({ page }) => {
    await joinGuild2(page, player8.email!, player8.password!);
  });

  test('add player nine to guild 2', async ({ page }) => {
    await joinGuild2(page, player9.email!, player9.password!);
  });

  test('add player ten to guild 2', async ({ page }) => {
    await joinGuild2(page, player10.email!, player10.password!);
  });
});
