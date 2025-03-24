import { test, expect } from '@playwright/test';

test.describe('User sign in with Mocked API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/signin'); // Navigate to the signin page
  });

  test('should successfully log in a user', async ({ page }) => {
    // Intercept the login API request and mock response
    await page.route('**/rpc/get_token', async (route) => {
      const requestBody = await route.request().postDataJSON();
      if (requestBody.mail === 'test@example.com' && requestBody.pass === 'password123') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ token: 'mocked-jwt-token' }),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Invalid credentials' }),
        });
      }
    });

    // Intercept the member details fetch request and return mock data
    await page.route('**/members*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'test_member',
            name: 'Mock User',
            quest_membership: [],
            guild_membership: [],
          },
        ]),
      });
    });

    // Fill in login details
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="pass"]', 'password123');

    // Click login button
    await page.click('button[name="loginBtn"]');

    // Expect success notification
    await expect(page.locator('.q-notification:has-text("You are logged in")')).toBeVisible();

    // Verify redirection to the lobby
    await expect(page).toHaveURL(/.*lobby/);
  });

  test('should show error on invalid login', async ({ page }) => {
    // Intercept failed login attempt
    await page.route('**/auth/signin', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      });
    });

    // Fill in wrong credentials
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="pass"]', 'wrongpassword');

    // Click login button
    await page.click('button[name="loginBtn"]');

    // Expect failure notification
    await expect(page.locator('.q-notification:has-text("Problem signing in")')).toBeVisible();
  });
});
