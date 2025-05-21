import test, { expect } from "@playwright/test";
import { mockNode, mockQuest, questCreator } from "../mocks/StoreMocks";


test.describe('Edit quest', () => {
  test.beforeEach(async({page}) => {
    await page.goto('http://localhost:8080/signin');
    await page.fill('input[name="email"]', questCreator.email!);
    await page.fill('input[name="pass"]', questCreator.password!);
    await page.click('button[name="loginBtn"]');
    await page.click('button[name="dashboardInstruction"]');
  })
  test('Quest creator can go to create quest page', async ({ page }) => {
    await page.goto('http://localhost:8080/quest/1/edit');
    await expect(page.locator('input[name="quest-title"]')).toHaveValue(mockQuest.name!)
    await page.getByRole('button', { name: 'registration' }).click();
    await page.click('[data-test="update-quest-btn"]');
    await expect(page.locator('p:has-text("Status:")')).toHaveText('Status: registration');
  });
})
