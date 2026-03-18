import { test, expect } from '@playwright/test';
import { admin } from '../utilities/StoreMocks';

test.describe('User signin page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9090/signin');
  });

  test('admin should successfully log in a user', async ({ page }) => {
    await page.fill('input[name="email"]', admin.email!);
    await page.fill('input[name="pass"]', admin.password!);
    await page.click('button[name="loginBtn"]');
    await expect(
      page.locator('.q-notification:has-text("You are logged in")'),
    ).toBeVisible();
    await expect(page).toHaveURL(/.*lobby/);
    await page.click('button[name="dashboardInstruction"]');
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="pass"]', 'wrongpassword');
    await page.click('button[name="loginBtn"]');
    await expect(
      page.locator('.q-notification:has-text("Problem signing in")'),
    ).toBeVisible();
  });
  test('should goto confirm password page when forgot password link clicked', async ({
    page,
  }) => {
    await page.click('text=Forgot password?');
    await expect(page).toHaveURL(/\/confirmPassword$/);
  });
});
