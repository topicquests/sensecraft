import { test, expect } from '@playwright/test';
import { admin, guildCreator1, guildCreator2, player1, player2, player3, player4, player5, player6, player7, player8, player9, player10,  questCreator } from '../utilities/StoreMocks'
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

  test('should register successfully guildCreator1', async ({ page }) => {
    await page.fill('input[name="email"]', guildCreator1.email!);
    await page.fill('input[name="name"]', guildCreator1.name!);
    await page.fill('input[name="handle"]', guildCreator1.handle!);
    await page.fill('input[name="password"]', guildCreator1.password!);
    await page.click('button[name="registerButton"]');
    const successNotification = page.locator('.q-notifications__list--bottom .q-notification:has-text("Account created successfully")');
    await expect(successNotification).toBeVisible();
    const token = await getEmailWithToken(guildCreator1.email!);
    await page.goto(token);
    await expect(page).toHaveURL('http://localhost:8080/lobby');
  });
  test('should register successfully guildCreator2', async ({ page }) => {
    await page.fill('input[name="email"]', guildCreator2.email!);
    await page.fill('input[name="name"]', guildCreator2.name!);
    await page.fill('input[name="handle"]', guildCreator2.handle!);
    await page.fill('input[name="password"]', guildCreator2.password!);
    await page.click('button[name="registerButton"]');
    const successNotification = page.locator('.q-notifications__list--bottom .q-notification:has-text("Account created successfully")');
    await expect(successNotification).toBeVisible();
    const token = await getEmailWithToken(guildCreator2.email!);
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
  test('should register successfully player2', async ({ page }) => {
    await page.fill('input[name="email"]', player2.email!);
    await page.fill('input[name="name"]', player2.name!);
    await page.fill('input[name="handle"]', player2.handle!);
    await page.fill('input[name="password"]', player2.password!);
    await page.click('button[name="registerButton"]');
    const successNotification = page.locator('.q-notifications__list--bottom .q-notification:has-text("Account created successfully")');
    await expect(successNotification).toBeVisible();
    const token = await getEmailWithToken(player2.email!);
    await page.goto(token);
    await expect(page).toHaveURL('http://localhost:8080/lobby');
  });
  test('should register successfully player3', async ({ page }) => {
    await page.fill('input[name="email"]', player3.email!);
    await page.fill('input[name="name"]', player3.name!);
    await page.fill('input[name="handle"]', player3.handle!);
    await page.fill('input[name="password"]', player3.password!);
    await page.click('button[name="registerButton"]');
    const successNotification = page.locator('.q-notifications__list--bottom .q-notification:has-text("Account created successfully")');
    await expect(successNotification).toBeVisible();
    const token = await getEmailWithToken(player3.email!);
    await page.goto(token);
    await expect(page).toHaveURL('http://localhost:8080/lobby');
  });
  test('should register successfully player4', async ({ page }) => {
    await page.fill('input[name="email"]', player4.email!);
    await page.fill('input[name="name"]', player4.name!);
    await page.fill('input[name="handle"]', player4.handle!);
    await page.fill('input[name="password"]', player4.password!);
    await page.click('button[name="registerButton"]');
    const successNotification = page.locator('.q-notifications__list--bottom .q-notification:has-text("Account created successfully")');
    await expect(successNotification).toBeVisible();
    const token = await getEmailWithToken(player4.email!);
    await page.goto(token);
    await expect(page).toHaveURL('http://localhost:8080/lobby');
  });
  test('should register successfully player5', async ({ page }) => {
    await page.fill('input[name="email"]', player5.email!);
    await page.fill('input[name="name"]', player5.name!);
    await page.fill('input[name="handle"]', player5.handle!);
    await page.fill('input[name="password"]', player5.password!);
    await page.click('button[name="registerButton"]');
    const successNotification = page.locator('.q-notifications__list--bottom .q-notification:has-text("Account created successfully")');
    await expect(successNotification).toBeVisible();
    const token = await getEmailWithToken(player5.email!);
    await page.goto(token);
    await expect(page).toHaveURL('http://localhost:8080/lobby');
  });
  test('should register successfully player6', async ({ page }) => {
    await page.fill('input[name="email"]', player6.email!);
    await page.fill('input[name="name"]', player6.name!);
    await page.fill('input[name="handle"]', player6.handle!);
    await page.fill('input[name="password"]', player6.password!);
    await page.click('button[name="registerButton"]');
    const successNotification = page.locator('.q-notifications__list--bottom .q-notification:has-text("Account created successfully")');
    await expect(successNotification).toBeVisible();
    const token = await getEmailWithToken(player6.email!);
    await page.goto(token);
    await expect(page).toHaveURL('http://localhost:8080/lobby');
  });
  test('should register successfully player7', async ({ page }) => {
    await page.fill('input[name="email"]', player7.email!);
    await page.fill('input[name="name"]', player7.name!);
    await page.fill('input[name="handle"]', player7.handle!);
    await page.fill('input[name="password"]', player7.password!);
    await page.click('button[name="registerButton"]');
    const successNotification = page.locator('.q-notifications__list--bottom .q-notification:has-text("Account created successfully")');
    await expect(successNotification).toBeVisible();
    const token = await getEmailWithToken(player7.email!);
    await page.goto(token);
    await expect(page).toHaveURL('http://localhost:8080/lobby');
  });
  test('should register successfully player8', async ({ page }) => {
    await page.fill('input[name="email"]', player8.email!);
    await page.fill('input[name="name"]', player8.name!);
    await page.fill('input[name="handle"]', player8.handle!);
    await page.fill('input[name="password"]', player8.password!);
    await page.click('button[name="registerButton"]');
    const successNotification = page.locator('.q-notifications__list--bottom .q-notification:has-text("Account created successfully")');
    await expect(successNotification).toBeVisible();
    const token = await getEmailWithToken(player8.email!);
    await page.goto(token);
    await expect(page).toHaveURL('http://localhost:8080/lobby');
  });
  test('should register successfully player9', async ({ page }) => {
    await page.fill('input[name="email"]', player9.email!);
    await page.fill('input[name="name"]', player9.name!);
    await page.fill('input[name="handle"]', player9.handle!);
    await page.fill('input[name="password"]', player9.password!);
    await page.click('button[name="registerButton"]');
    const successNotification = page.locator('.q-notifications__list--bottom .q-notification:has-text("Account created successfully")');
    await expect(successNotification).toBeVisible();
    const token = await getEmailWithToken(player9.email!);
    await page.goto(token);
    await expect(page).toHaveURL('http://localhost:8080/lobby');
  });
  test('should register successfully player10', async ({ page }) => {
    await page.fill('input[name="email"]', player10.email!);
    await page.fill('input[name="name"]', player10.name!);
    await page.fill('input[name="handle"]', player10.handle!);
    await page.fill('input[name="password"]', player10.password!);
    await page.click('button[name="registerButton"]');
    const successNotification = page.locator('.q-notifications__list--bottom .q-notification:has-text("Account created successfully")');
    await expect(successNotification).toBeVisible();
    const token = await getEmailWithToken(player10.email!);
    await page.goto(token);
    await expect(page).toHaveURL('http://localhost:8080/lobby');
  });

});
