import test, { expect } from 'playwright/test';

test('should display House Rules page correctly', async ({ page }) => {
  // Navigate to the page where house rules are located
  await page.goto('http://localhost:9090/house_rules'); // Adjust this URL according to your routing setup

  // Ensure the page title is correct
  await expect(page.locator('h2')).toHaveText('House Rules');

  // Ensure the "About" header is visible
  await expect(page.locator('h4')).toHaveText('About');

  // Check for specific content in the paragraph (the rules)
  await expect(page.locator('p').nth(0)).toContainText(
    'Sensecraft promotes an ecosystem of Trust and Safety and Civil conversation',
  );
  await expect(page.locator('p').nth(1)).toContainText(
    'These are simple rules, a minimalist set.',
  );
});
