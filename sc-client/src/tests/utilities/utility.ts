import { Locator, Page } from '@playwright/test';
import { GuildData, Member } from '../../types';

export async function signInPage(player: Partial<Member>, page: Page) {
  await page.goto('http://localhost:8080/signin');
  await page.fill('input[name="email"]', player.email!);
  await page.fill('input[name="pass"]', player.password!);
  await page.click('button[name="loginBtn"]');
}
export function getRoleSelectByHandle(page: Page, handle: string): Locator {
  const block = page.locator(`[data-testid="member-block-${handle}"]`);
  return block.locator('.q-select'); // Top-level clickable container
}
export async function gotoGuildPage(
  guild: Partial<GuildData>,
  action: string,
  page: Page,
) {
  const row = page.locator('.guilds-table tbody tr', {
    has: page.locator('td', { hasText: guild.name }),
  });
  const viewLink = row.locator('a', { hasText: action });
  await viewLink.click();
}
