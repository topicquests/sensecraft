import {test, expect} from '@playwright/test';
import {player6, player7, player8, player9, player10, guild2} from '../mocks/StoreMocks';

test.describe('Add players to guild 2', () => {
    test.beforeEach(async({page}) => {
        await page.goto('http://localhost:8080/signin')
    })

    test('add player six to guild 2', async ({ page }) => {
    // Sign in
    await page.fill('input[name="email"]', player6.email!);
    await page.fill('input[name="pass"]', player6.password!);
    await page.click('button[name="loginBtn"]');

    // Wait for lobby
    await expect(page).toHaveURL(/.*lobby/);

    // Dismiss dashboard instruction
    await page.click('button[name="dashboardInstruction"]');

    // Find the row containing "Saggezza"
    const row = page.locator('.guilds-table tbody tr', {
      has: page.locator('td', { hasText: guild2.name }),
    });

    await expect(row).toBeVisible();
    const viewLink = row.locator('a', { hasText: 'View' });
    await expect(viewLink).toBeVisible();
    await viewLink.click();
    await expect(page).toHaveURL(/.*guild\/\d+/);
    await expect(page.locator('.guild-page')).toBeVisible();

    const joinButton = page.locator('button', { hasText: 'Join' });
    if (await joinButton.isVisible()) {
      await joinButton.click();
      await expect(joinButton).toBeHidden();
    }
  });
  test('add player seven to guild 2', async ({ page }) => {
    // Sign in
    await page.fill('input[name="email"]', player7.email!);
    await page.fill('input[name="pass"]', player7.password!);
    await page.click('button[name="loginBtn"]');

    // Wait for lobby
    await expect(page).toHaveURL(/.*lobby/);

    // Dismiss dashboard instruction
    await page.click('button[name="dashboardInstruction"]');

     // Find the row containing "Saggezza"
    const row = page.locator('.guilds-table tbody tr', {
      has: page.locator('td', { hasText: guild2.name }),
    });

    await expect(row).toBeVisible();
    const viewLink = row.locator('a', { hasText: 'View' });
    await expect(viewLink).toBeVisible();
    await viewLink.click();
    await expect(page).toHaveURL(/.*guild\/\d+/);
    await expect(page.locator('.guild-page')).toBeVisible();

    const joinButton = page.locator('button', { hasText: 'Join' });
    if (await joinButton.isVisible()) {
      await joinButton.click();
      await expect(joinButton).toBeHidden();
    }
  });
  test('add player eight to guild 2', async ({ page }) => {
    // Sign in
    await page.fill('input[name="email"]', player8.email!);
    await page.fill('input[name="pass"]', player8.password!);
    await page.click('button[name="loginBtn"]');

    // Wait for lobby
    await expect(page).toHaveURL(/.*lobby/);

    // Dismiss dashboard instruction
    await page.click('button[name="dashboardInstruction"]');

    // Find the row containing "Saggezza"
    const row = page.locator('.guilds-table tbody tr', {
      has: page.locator('td', { hasText: guild2.name }),
    });

    await expect(row).toBeVisible();
    const viewLink = row.locator('a', { hasText: 'View' });
    await expect(viewLink).toBeVisible();
    await viewLink.click();
    await expect(page).toHaveURL(/.*guild\/\d+/);
    await expect(page.locator('.guild-page')).toBeVisible();

    const joinButton = page.locator('button', { hasText: 'Join' });
    if (await joinButton.isVisible()) {
      await joinButton.click();
      await expect(joinButton).toBeHidden();
    }
  });
  test('add player nine to guild 2', async ({ page }) => {
    // Sign in
    await page.fill('input[name="email"]', player9.email!);
    await page.fill('input[name="pass"]', player9.password!);
    await page.click('button[name="loginBtn"]');

    // Wait for lobby
    await expect(page).toHaveURL(/.*lobby/);

    // Dismiss dashboard instruction
    await page.click('button[name="dashboardInstruction"]');

    // Find the row containing "Saggezza"
    const row = page.locator('.guilds-table tbody tr', {
      has: page.locator('td', { hasText: guild2.name }),
    });

    await expect(row).toBeVisible();
    const viewLink = row.locator('a', { hasText: 'View' });
    await expect(viewLink).toBeVisible();
    await viewLink.click();
    await expect(page).toHaveURL(/.*guild\/\d+/);
    await expect(page.locator('.guild-page')).toBeVisible();

    const joinButton = page.locator('button', { hasText: 'Join' });
    if (await joinButton.isVisible()) {
      await joinButton.click();
      await expect(joinButton).toBeHidden();
    }
  });
  test('add player ten to guild 2', async ({ page }) => {
    // Sign in
    await page.fill('input[name="email"]', player10.email!);
    await page.fill('input[name="pass"]', player10.password!);
    await page.click('button[name="loginBtn"]');

    // Wait for lobby
    await expect(page).toHaveURL(/.*lobby/);

    // Dismiss dashboard instruction
    await page.click('button[name="dashboardInstruction"]');

     // Find the row containing "Saggezza"
    const row = page.locator('.guilds-table tbody tr', {
      has: page.locator('td', { hasText: guild2.name }),
    });

    await expect(row).toBeVisible();
    const viewLink = row.locator('a', { hasText: 'View' });
    await expect(viewLink).toBeVisible();
    await viewLink.click();
    await expect(page).toHaveURL(/.*guild\/\d+/);
    await expect(page.locator('.guild-page')).toBeVisible();

    const joinButton = page.locator('button', { hasText: 'Join' });
    if (await joinButton.isVisible()) {
      await joinButton.click();
      await expect(joinButton).toBeHidden();
    }
  });
})
