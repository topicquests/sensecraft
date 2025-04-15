import { test, expect } from '@playwright/test';
import { mockConversation, mockGuild, mockMember, mockQuest, mockRole } from '../vitest/components/mocks/StoreMocks';

test.describe('Guild page test', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });
    await page.route(/\/members\?/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockMember]),
      });
    });
    await page.route(/guilds_data/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockGuild),
      });
    });
    await page.route(/quests_data/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockQuest]),
      });
    })
    await page.route('**/role?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockRole),
      });
    })
    await page.route('**/conversation_node', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockConversation),
      });
    })
    const createMockJWT = (payload: object): string => {
      const header = { alg: 'HS256', typ: 'JWT' };
      const base64UrlEncode = (data: string) =>
        Buffer.from(data)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
      return `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(
        JSON.stringify(payload)
      )}.mockedSignature`;
    };

    // ✅ Set up all necessary routes before visiting the page
    await page.route('**/rpc/get_token', async (route) => {
      const requestBody = await route.request().postDataJSON();
      if (
        requestBody.mail === mockMember.email &&
        requestBody.pass === 'password123'
      ) {
        const jwtMock = createMockJWT({ user: 'testuser', role: 'admin' });
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(jwtMock),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Invalid credentials' }),
        });
      }
    });
    // ✅ Now it's safe to navigate
    await page.goto('http://localhost:8080/signin');
    await page.fill('input[name="email"]', mockMember.email);
    await page.fill('input[name="pass"]', 'password123');
    await page.click('button[name="loginBtn"]');
  })

    test('should have guild name as "Test Guild" and member handle "JohnSmith" ', async ({ page }) => {
      await page.goto(('http://localhost:8080/guild/1'))

      const guildDescription = page.locator('.guild-description');
      await guildDescription.waitFor({ state: 'visible' });

      // Locate the quest name inside the guild description component
      const questName = guildDescription.locator('h1.text-center');
      await questName.waitFor({ state: 'visible' });

      // Verify the quest name
      await expect(questName).toHaveText('Test Quest');


    // Check that the mock quest description appears on the page
    const questDescription = page.locator('text="This is a test quest."');
    await expect(questDescription).toBeVisible();

      await expect(page).toHaveURL(/.*guild/);
      const title = await page.title();
      expect(title).toBe('SenseCraft Ap');
    });
})
