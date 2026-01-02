import { Page, Locator, expect } from '@playwright/test';

/* ---------------------------------------------------------
 * Auth & Navigation
 * --------------------------------------------------------- */

export async function signInPage(
  player: { email?: string; password?: string },
  page: Page
) {
  await page.goto('http://localhost:8080/signin');
  await page.fill('input[name="email"]', player.email!);
  await page.fill('input[name="pass"]', player.password!);
  await page.locator('[data-test="login-btn"]').click();
}

export async function gotoGuildPage(
  guild: { name?: string },
  action: string,
  page: Page
) {
  const row = page.locator('.guilds-table tbody tr', {
    has: page.locator('td', { hasText: guild.name }),
  });

  const link = row.getByRole('link', { name: action });
  await expect(link).toBeVisible();
  await link.click();
}

export function getMemberBlock(
  page: Page,
  handle: string | number
): Locator {
  return page.locator(`[data-test="member-block-${handle}"]`);
}

export function getMemberRoleChipsByMember(
  page: Page,
  handle: string | number
): Locator {
  return getMemberBlock(page, handle).locator('.q-chip');
}

export function getAvailableRolesControlByMember(
  page: Page,
  handle: string | number
): Locator {
  return getMemberBlock(page, handle).locator(
    '[data-test="available-roles-selector"]'
  );
}

/* ---------------------------------------------------------
 * Role helpers
 * --------------------------------------------------------- */

export async function clearRolesForMember(
  page: Page,
  handle: string
) {
  const memberBlock = getMemberBlock(page, handle);

  while (await memberBlock.locator('.q-chip').count() > 0) {
    const chip = memberBlock.locator('.q-chip').first();
    const chipText = await chip.innerText();

    const removeBtn = chip.locator('i.q-chip__icon--remove');
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();

    // Wait until THIS specific chip (by text) is gone
    await expect(
      memberBlock.locator('.q-chip', { hasText: chipText })
    ).toHaveCount(0);
  }
}

export async function setRoleForMember(
  page: Page,
  handle: string,
  roleName: string
) {
  await clearRolesForMember(page, handle);

  const control = getAvailableRolesControlByMember(page, handle);
  await expect(control).toBeVisible();
  await control.click();

  const menu = page.locator('.q-menu[role="listbox"]');
  await expect(menu).toBeVisible();
  await menu.getByRole('option', { name: roleName }).click();

  const chips = getMemberRoleChipsByMember(page, handle);
  await expect(chips.filter({ hasText: roleName })).toHaveCount(1);
}

export async function addRoleToMember(
  page: Page,
  handle: string,
  roleName: string
) {
  const control = getAvailableRolesControlByMember(page, handle);
  await expect(control).toBeVisible();
  await control.click();

  const menu = page.locator('.q-menu[role="listbox"]');
  await expect(menu).toBeVisible();
  await menu.getByRole('option', { name: roleName }).click();
}

export async function removeRoleFromMember(
  page: Page,
  handle: string,
  roleName: string
) {
  const memberBlock = getMemberBlock(page, handle);
  const chip = memberBlock.locator('.q-chip', { hasText: roleName });

  await expect(chip).toHaveCount(1);

  const removeBtn = chip.locator('i.q-chip__icon--remove');
  await expect(removeBtn).toBeVisible();
  await removeBtn.click();

  await expect(chip).toHaveCount(0);
}

/* ---------------------------------------------------------
 * Assertions (optional but recommended)
 * --------------------------------------------------------- */

export async function expectMemberHasRole(
  page: Page,
  handle: string,
  roleName: string
) {
  const chips = getMemberRoleChipsByMember(page, handle);
}

export async function expectMemberHasNoRole(
  page: Page,
  handle: string,
  roleName: string
) {
  const chips = getMemberRoleChipsByMember(page, handle);
}
