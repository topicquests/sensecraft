import { test, expect, Page } from '@playwright/test';
import {
  admin,
  guildCreator1,
  guildCreator2,
  player1,
  player2,
  player3,
  player4,
  player5,
  player6,
  player7,
  player8,
  player9,
  player10,
  questCreator,
} from '../utilities/StoreMocks';
import { getEmailWithToken } from '../utils/mailhog-util';

/**
 * ---------------------------
 * Selectors (single source)
 * ---------------------------
 */
const selectors = {
  email: 'input[name="email"]',
  name: 'input[name="name"]',
  handle: 'input[name="handle"]',
  password: 'input[name="password"]',
  confirmPassword: 'input[name="confirmPassword"]',
  registerButton: 'button[name="registerButton"]',
  inlineError: '.text-red.text-caption',
  notification: '.q-notifications__list--bottom .q-notification',
};

/**
 * ---------------------------
 * Helpers
 * ---------------------------
 */
async function fillRegistrationForm(
  page: Page,
  {
    email,
    name,
    handle,
    password,
    confirmPassword,
  }: {
    email?: string;
    name?: string;
    handle?: string;
    password?: string;
    confirmPassword?: string;
  },
) {
  if (email !== undefined) await page.fill(selectors.email, email);
  if (name !== undefined) await page.fill(selectors.name, name);
  if (handle !== undefined) await page.fill(selectors.handle, handle);
  if (password !== undefined) await page.fill(selectors.password, password);
  if (confirmPassword !== undefined)
    await page.fill(selectors.confirmPassword, confirmPassword);
}

async function submit(page: Page) {
  await page.click(selectors.registerButton);
}

function notificationWithText(page: Page, text: string | RegExp) {
  return page.locator(selectors.notification).filter({ hasText: text });
}

/**
 * ---------------------------
 * Tests
 * ---------------------------
 */
test.describe('User registration page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/register');
  });

  test('registers successfully with valid details', async ({ page }) => {
    await fillRegistrationForm(page, {
      email: admin.email!,
      name: admin.name!,
      handle: admin.handle!,
      password: admin.password!,
      confirmPassword: admin.password!,
    });

    await submit(page);

    await expect(
      notificationWithText(page, /account created successfully/i),
    ).toBeVisible();

    await expect(page).toHaveURL(/\/confirm$/);
  });

  test('shows error for duplicate email', async ({ page }) => {
    await fillRegistrationForm(page, {
      email: admin.email!,
      name: admin.name!,
      handle: admin.handle!,
      password: admin.password!,
      confirmPassword: admin.password!,
    });

    await submit(page);

    await expect(
      notificationWithText(page, /already exists/i),
    ).toBeVisible();
  });

  test('shows inline validation for missing email', async ({ page }) => {
    await fillRegistrationForm(page, {
      email: '',
      name: 'Existing User',
      handle: 'existinguser',
      password: 'SecurePassword123',
      confirmPassword: 'SecurePassword123',
    });

    await submit(page);

    await expect(page.locator(selectors.inlineError))
      .toContainText(/invalid email/i);
  });

  test('shows error notification for missing name', async ({ page }) => {
    await fillRegistrationForm(page, {
      email: 'existinguser@example.com',
      name: '',
      handle: 'existinguser',
      password: 'SecurePassword123',
      confirmPassword: 'SecurePassword123',
    });

    await submit(page);

    await expect(
      notificationWithText(page, /missing name/i),
    ).toBeVisible();
  });

  test('shows error notification for missing handle', async ({ page }) => {
    await fillRegistrationForm(page, {
      email: 'existinguser@example.com',
      name: 'Existing User',
      handle: '',
      password: 'SecurePassword123',
      confirmPassword: 'SecurePassword123',
    });

    await submit(page);

    await expect(
      notificationWithText(page, /missing handle/i),
    ).toBeVisible();
  });

 test('shows validation error for missing password', async ({ page }) => {
  await fillRegistrationForm(page, {
    email: 'existinguser@example.com',
    name: 'Existing User',
    handle: 'existinguser',
    password: '',
    confirmPassword: '',
  });

  await submit(page);

  // Inline error (authoritative)
  await expect(page.locator(selectors.inlineError))
    .toContainText(/password is required/i);

  // Generic form-blocked notification
  await expect(
    notificationWithText(page, /please fix errors/i),
  ).toBeVisible();
});


  test('shows inline validation for invalid email format', async ({ page }) => {
    await fillRegistrationForm(page, {
      email: 'invalid-email',
      name: 'Test User',
      handle: 'testuser',
      password: 'TestPassword123',
    });

    await submit(page);

    await expect(page.locator(selectors.inlineError))
      .toContainText(/invalid email format/i);
  });

  /**
   * ---------------------------
   * Role-based success tests
   * ---------------------------
   */
  for (const user of [
    questCreator,
    guildCreator1,
    guildCreator2,
    player1,
    player2,
    player3,
    player4,
    player5,
    player6,
    player7,
    player8,
    player9,
    player10,
  ]) {
    test(`registers successfully: ${user.handle}`, async ({ page }) => {
      await fillRegistrationForm(page, {
        email: user.email!,
        name: user.name!,
        handle: user.handle!,
        password: user.password!,
        confirmPassword: user.password!,
      });

      await submit(page);

      await expect(
        notificationWithText(page, /account created successfully/i),
      ).toBeVisible();

      const token = await getEmailWithToken(user.email!);
      await page.goto(token);
      await expect(page).toHaveURL(/\/lobby$/);
    });
  }
});
