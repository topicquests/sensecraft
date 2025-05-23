import {test, expect} from '@playwright/test';
import {player1, player2, player3, player4, player5} from '../mocks/StoreMocks';

test.describe('Add players to guild one', () => {
    test.beforeEach(async({page}) => {
        await page.goto('http://localhost:8080/signin')
    })
    
    test('add player one to guild 1', async ({ page }) => {
    // Sign in
    await page.fill('input[name="email"]', player1.email!);
    await page.fill('input[name="pass"]', player1.password!);
    await page.click('button[name="loginBtn"]');

    // Wait for lobby
    await expect(page).toHaveURL(/.*lobby/);

    // Dismiss dashboard instruction
    await page.click('button[name="dashboardInstruction"]');

    // Find the row containing "Black Knights"
    const row = page.locator('.guilds-table tbody tr', {
      has: page.locator('td', { hasText: 'Black Knights' }),
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
  test('add player two to guild 1', async ({ page }) => {
    // Sign in
    await page.fill('input[name="email"]', player2.email!);
    await page.fill('input[name="pass"]', player2.password!);
    await page.click('button[name="loginBtn"]');

    // Wait for lobby
    await expect(page).toHaveURL(/.*lobby/);

    // Dismiss dashboard instruction
    await page.click('button[name="dashboardInstruction"]');

    // Find the row containing "Black Knights"
    const row = page.locator('.guilds-table tbody tr', {
      has: page.locator('td', { hasText: 'Black Knights' }),
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
  test('add player three to guild 1', async ({ page }) => {
    // Sign in
    await page.fill('input[name="email"]', player3.email!);
    await page.fill('input[name="pass"]', player3.password!);
    await page.click('button[name="loginBtn"]');

    // Wait for lobby
    await expect(page).toHaveURL(/.*lobby/);

    // Dismiss dashboard instruction
    await page.click('button[name="dashboardInstruction"]');

    // Find the row containing "Black Knights"
    const row = page.locator('.guilds-table tbody tr', {
      has: page.locator('td', { hasText: 'Black Knights' }),
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
  test('add player four to guild 1', async ({ page }) => {
    // Sign in
    await page.fill('input[name="email"]', player4.email!);
    await page.fill('input[name="pass"]', player4.password!);
    await page.click('button[name="loginBtn"]');

    // Wait for lobby
    await expect(page).toHaveURL(/.*lobby/);

    // Dismiss dashboard instruction
    await page.click('button[name="dashboardInstruction"]');

    // Find the row containing "Black Knights"
    const row = page.locator('.guilds-table tbody tr', {
      has: page.locator('td', { hasText: 'Black Knights' }),
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
  test('add player five to guild 1', async ({ page }) => {
    // Sign in
    await page.fill('input[name="email"]', player5.email!);
    await page.fill('input[name="pass"]', player5.password!);
    await page.click('button[name="loginBtn"]');

    // Wait for lobby
    await expect(page).toHaveURL(/.*lobby/);

    // Dismiss dashboard instruction
    await page.click('button[name="dashboardInstruction"]');

    // Find the row containing "Black Knights"
    const row = page.locator('.guilds-table tbody tr', {
      has: page.locator('td', { hasText: 'Black Knights' }),
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