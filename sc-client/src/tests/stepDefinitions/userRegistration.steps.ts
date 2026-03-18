import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { Page } from 'playwright'; // Ensure you have playwright and its types installed

let page: Page; // Playwright page instance

// Given: Open the registration page
Given('I open the registration page', async function () {
  // Assuming you have initialized Playwright and opened a browser
  page = this.page; // The page object is passed into the context of each step
  await page.goto('http://localhost:9090/register');
});

// When: Fill the registration form with valid details
When('I fill the registration form with valid details', async function () {
  await page.fill('input[name="email"]', 'newuser@example.com');
  await page.fill('input[name="name"]', 'New User');
  await page.fill('input[name="handle"]', 'newuser123');
  await page.fill('input[name="password"]', 'StrongPassword123');
});

// And: Click the register button
When('I click the register button', async function () {
  await page.click('button[name="registerButton"]');
});

// Then: Verify the success message
Then('I should see a success message', async function () {
  const successMessage = await page.locator('.success-message');
  await expect(successMessage).toBeVisible();
});

// Scenario for missing email
When('I fill the registration form without an email', async function () {
  await page.fill('input[name="name"]', 'New User');
  await page.fill('input[name="handle"]', 'newuser123');
  await page.fill('input[name="password"]', 'StrongPassword123');
});

// Scenario for invalid email format
When('I fill the registration form with an invalid email', async function () {
  await page.fill('input[name="email"]', 'invalid-email');
  await page.fill('input[name="name"]', 'New User');
  await page.fill('input[name="handle"]', 'newuser123');
  await page.fill('input[name="password"]', 'StrongPassword123');
});

// Then: Validation error for missing email
Then('I should see a validation error for missing email', async function () {
  const errorMessage = await page.locator('.error-message');
  await expect(errorMessage).toHaveText('Email is required');
});

// Then: Validation error for invalid email format
Then('I should see a validation error for invalid email', async function () {
  const errorMessage = await page.locator('.error-message');
  await expect(errorMessage).toHaveText('Invalid email format');
});
