import { test, expect, Page, Locator } from '@playwright/test';
import { guild2, guildCreator2, player6, player7, player8, player9 } from '../mocks/StoreMocks';
export function getRoleSelectByHandle(page: Page, handle: string): Locator {
  const block = page.locator(`[data-testid="member-block-${handle}"]`);
  return block.locator('.q-select'); // Top-level clickable container
}
test.describe('Guild creator Permission Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/signin');
    await page.fill('input[name="email"]', guildCreator2.email!);
    await page.fill('input[name="pass"]', guildCreator2.password!);
    await page.click('button[name="loginBtn"]');
  });
   test('Guild creator can go to create guild page', async ({ page }) => {
    const row = page.locator('.guilds-table tbody tr', {
      has: page.locator('td', { hasText: guild2.name }),
    });
    await expect(row).toBeVisible();
    const viewLink = row.locator('a', { hasText: 'Admin' });
    await expect(viewLink).toBeVisible();
    await viewLink.click();
    await expect(page).toHaveURL(/.*guild\/\d+\/admin/);
   })
   test('Guild admin set guildCreator2 remove Researcher and add Game leader', async({page}) => {
      const row = page.locator('.guilds-table tbody tr', {
        has: page.locator('td', { hasText: guild2.name }),
      });
      const viewLink = row.locator('a', { hasText: 'Admin' });
      await viewLink.click();
      await expect(page).toHaveURL(/.*guild\/\d+\/admin/);
      const qSelect = getRoleSelectByHandle(page, guildCreator2.handle!);
      await qSelect.click();
      const researcherRemove = page.locator('.q-menu .q-item', { hasText: 'Reserarcher' });
      await researcherRemove.click();
      const gameLeaderOption = page.locator('.q-menu .q-item', { hasText: 'Game leader' });
      await gameLeaderOption.click();
    })
    test('Guild admin set playerSix to Researcher, Pholospher', async({page}) => {
      const row = page.locator('.guilds-table tbody tr', {
        has: page.locator('td', { hasText: guild2.name }),
      });
      const viewLink = row.locator('a', { hasText: 'Admin' });
      await viewLink.click();
      const qSelect = getRoleSelectByHandle(page, player6.handle!);
      await qSelect.click();
      const philosopherOption = page.locator('.q-menu .q-item', { hasText: 'Philosopher' });
      await philosopherOption.click();
    })
    test('Guild admin set playerSeven keep Researcher', async({page}) => {
      const row = page.locator('.guilds-table tbody tr', {
        has: page.locator('td', { hasText: guild2.name }),
      });
      const viewLink = row.locator('a', { hasText: 'Admin' });
      await viewLink.click();
      const qSelect = getRoleSelectByHandle(page, player7.handle!);
      await qSelect.click();
      await page.waitForSelector('.q-menu');
      const removeResearcher = page.locator('.q-menu .q-item', { hasText: 'Researcher' });
      await removeResearcher.click();
      const addCritic = page.locator('.q-menu .q-item' , {hasText: 'Critic'})
      await addCritic.click();
    })
    test('Guild admin set playerEight remove Researcher and add Critic', async({page}) => {
      const row = page.locator('.guilds-table tbody tr', {
        has: page.locator('td', { hasText: guild2.name }),
      });
      const viewLink = row.locator('a', { hasText: 'Admin' });
      await viewLink.click();
      const qSelect = getRoleSelectByHandle(page, player8.handle!);
      await qSelect.click();
    })
    test('Guild admin set playerNine remove Researcher and add Scribe', async({page}) => {
      const row = page.locator('.guilds-table tbody tr', {
        has: page.locator('td', { hasText: guild2.name }),
      });
      const viewLink = row.locator('a', { hasText: 'Admin' });
      await viewLink.click();
      const qSelect = getRoleSelectByHandle(page, player9.handle!);
      await qSelect.click();
      await page.waitForSelector('.q-menu');
      const removeResearcher = page.locator('.q-menu .q-item', { hasText: 'Researcher' });
      await removeResearcher.click();
      const addScribe = page.locator('.q-menu .q-item' , {hasText: 'Scribe'})
      await addScribe.click();
  })
});
