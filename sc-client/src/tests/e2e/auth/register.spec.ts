import { test, expect } from '@playwright/test';

test.describe('User Registration with Mocked API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/register');
  });
  test('should register successfully with valid details', async ({ page }) => {
    // Mock API response for successful registration
    await page.route('**/rpc/create_member', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Account created successfully' }),
      });
    });

    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="name"]', 'New User');
    await page.fill('input[name="handle"]', 'newuser123');
    await page.fill('input[name="password"]', 'StrongPassword123');

    await page.click('button[name="registerButton"]');
    const successNotification = page.locator('.q-notifications__list--bottom .q-notification:has-text("Account created successfully")');
    await expect(successNotification).toBeVisible();
    await expect(page).toHaveURL('http://localhost:8080/confirm');
  });

  test('should show error for duplicate email', async ({ page }) => {
    // Mock API response for duplicate email error
    await page.route('**/rpc/create_member', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Email already exists' }),
      });
    });

    await page.fill('input[name="email"]', 'existinguser@example.com');
    await page.fill('input[name="name"]', 'Existing User');
    await page.fill('input[name="handle"]', 'existinguser');
    await page.fill('input[name="password"]', 'SecurePassword123');

    await page.click('button[name="registerButton"]');
  });

  test('should show validation errors for missing email', async ({ page }) => {
    await page.fill('input[name="email"]', '');
    await page.fill('input[name="name"]', 'Existing User');
    await page.fill('input[name="handle"]', 'existinguser');
    await page.fill('input[name="password"]', 'SecurePassword123');
    await page.click('button[name="registerButton"]');
    await expect(page.locator('.q-notifications__list--bottom .q-notification:has-text("Missing Email")')).toBeVisible();
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
});
