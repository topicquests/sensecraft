import { test, expect } from '@playwright/test';
import { admin, guildCreator, player1, questCreator } from '../mocks/StoreMocks'
import { getEmailWithToken } from '../utils/mailhog-util';

test.describe('User registration page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/register');
  });
  test('should register successfully with valid details', async ({ page }) => {
    await page.fill('input[name="email"]', admin.email!);
    await page.fill('input[name="name"]', admin.name!);
    await page.fill('input[name="handle"]', admin.handle!);
    await page.fill('input[name="password"]', admin.password!);

    await page.click('button[name="registerButton"]');
    const successNotification = page.locator('.q-notifications__list--bottom .q-notification:has-text("Account created successfully")');
    await expect(successNotification).toBeVisible();
    await expect(page).toHaveURL('http://localhost:8080/confirm');
  });

  test('should show error for duplicate email', async ({ page }) => {
    await page.fill('input[name="email"]', admin.email!);
    await page.fill('input[name="name"]', admin.name!);
    await page.fill('input[name="handle"]', admin.handle!);
    await page.fill('input[name="password"]', admin.password!);
    await page.click('button[name="registerButton"]');
    const duplicateEmailNotification = page.locator('.q-notifications__list--bottom .q-notification:has-text("An account with this email already exists.")')
    await expect(duplicateEmailNotification).toBeVisible();
  });

  test('should show validation errors for missing email', async ({ page }) => {
    await page.fill('input[name="email"]', '');
    await page.fill('input[name="name"]', 'Existing User');
    await page.fill('input[name="handle"]', 'existinguser');
    await page.fill('input[name="password"]', 'SecurePassword123');
    await page.click('button[name="registerButton"]');
    await expect(page.locator('.q-notifications__list--bottom .q-notification:has-text("Invalid or Missing Email")')).toBeVisible();
  });
  test('should show validation errors for missing name', async ({ page }) => {
    await page.fill('input[name="email"]', 'existinguser@example.com');
    await page.fill('input[name="name"]', '');
    await page.fill('input[name="handle"]', 'existinguser');
    await page.fill('input[name="password"]', 'SecurePassword123');
    await page.click('button[name="registerButton"]');
    await expect(page.locator('.q-notifications__list--bottom .q-notification:has-text("Missing Name field")')).toBeVisible();
  });
  test('should show validation errors for missing handle', async ({ page }) => {
    await page.fill('input[name="email"]', 'existinguser@example.com');
    await page.fill('input[name="name"]', 'Existing User');
    await page.fill('input[name="handle"]', '');
    await page.fill('input[name="password"]', 'SecurePassword123');
    await page.click('button[name="registerButton"]');
    await expect(page.locator('.q-notifications__list--bottom .q-notification:has-text("Missing Handle")')).toBeVisible();
  });
  test('should show validation errors for missing password', async ({ page }) => {
    await page.fill('input[name="email"]', 'existinguser@example.com');
    await page.fill('input[name="name"]', 'Existing User');
    await page.fill('input[name="handle"]', 'existinguser');
    await page.fill('input[name="password"]', '');
    await page.click('button[name="registerButton"]');
    await expect(page.locator('.q-notifications__list--bottom .q-notification:has-text("Missing Password")')).toBeVisible();
  });

  test('should show an error for invalid email format', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="handle"]', 'testuser123');
    await page.fill('input[name="password"]', 'TestPassword123');
    await page.click('button[name="registerButton"]');

    // Expect error message for invalid email
    await expect(page.locator('.text-red')).toHaveText(/Invalid email format/i);
  });
  test('should register successfully questCreator', async ({ page }) => {
    await page.fill('input[name="email"]', questCreator.email!);
    await page.fill('input[name="name"]', questCreator.name!);
    await page.fill('input[name="handle"]', questCreator.handle!);
    await page.fill('input[name="password"]', questCreator.password!);
    await page.click('button[name="registerButton"]');
    const successNotification = page.locator('.q-notifications__list--bottom .q-notification:has-text("Account created successfully")');
    await expect(successNotification).toBeVisible();
    const token = await getEmailWithToken(questCreator.email!);
    await page.goto(token);
    await expect(page).toHaveURL('http://localhost:8080/lobby');
  });

  test('should register successfully guildCreator', async ({ page }) => {
    await page.fill('input[name="email"]', guildCreator.email!);
    await page.fill('input[name="name"]', guildCreator.name!);
    await page.fill('input[name="handle"]', guildCreator.handle!);
    await page.fill('input[name="password"]', guildCreator.password!);
    await page.click('button[name="registerButton"]');
    const successNotification = page.locator('.q-notifications__list--bottom .q-notification:has-text("Account created successfully")');
    await expect(successNotification).toBeVisible();
    const token = await getEmailWithToken(guildCreator.email!);
    await page.goto(token);
    await expect(page).toHaveURL('http://localhost:8080/lobby');
  });

  test('should register successfully player1', async ({ page }) => {
    await page.fill('input[name="email"]', player1.email!);
    await page.fill('input[name="name"]', player1.name!);
    await page.fill('input[name="handle"]', player1.handle!);
    await page.fill('input[name="password"]', player1.password!);
    await page.click('button[name="registerButton"]');
    const successNotification = page.locator('.q-notifications__list--bottom .q-notification:has-text("Account created successfully")');
    await expect(successNotification).toBeVisible();
    const token = await getEmailWithToken(player1.email!);
    await page.goto(token);
    await expect(page).toHaveURL('http://localhost:8080/lobby');
  });
});
