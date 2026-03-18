import { Page, Locator, expect } from '@playwright/test';

/* ---------------------------------------------------------
 * Auth & Navigation
 * --------------------------------------------------------- */

export async function submitNodeByTitle(page: Page, title: string) {
  const nodeHeader = page.locator('.q-tree__node-header').filter({ hasText: title });
  await nodeHeader.locator('button:has(i.material-icons:text-is("edit"))').click();
  await page.waitForSelector('[data-test="update-node-btn"]');

  await page.click('[data-test="node-status-selector"]');
  const statusMenu = page.locator('.q-menu').filter({ hasText: 'submitted' });
  await expect(statusMenu).toBeVisible();
  await statusMenu.getByRole('option', { name: 'submitted', exact: true }).click();

  await page.click('[data-test="update-node-btn"]');
  await expect(page.getByRole('alert').filter({ hasText: 'node updated' })).toBeVisible();
}

export async function signInPage(
  player: { email?: string; password?: string },
  page: Page
) {
  await page.goto('http://localhost:9090/signin');
  await page.fill('input[name="email"]', player.email!);
  await page.fill('input[name="pass"]', player.password!);
  await page.locator('[data-test="login-btn"]').click();
  await page.waitForURL('**/lobby', { timeout: 15000 });
}

/**
 * Dismiss the first-login dashboard instruction modal if it appears.
 * Safe to call even if the modal is already dismissed.
 */
export async function dismissDashboardInstruction(page: Page) {
  try {
    await page.click('button[name="dashboardInstruction"]', { timeout: 3000 });
  } catch {
    // Already dismissed or not present — continue
  }
}

/**
 * Join a guild if not already a member.
 * Waits for the guild page to finish loading before checking the join button.
 */
export async function joinGuildIfNotMember(page: Page) {
  const joinButton = page.locator('button', { hasText: 'Join' });
  const isJoinVisible = await joinButton
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  if (isJoinVisible) {
    await joinButton.click();
    await expect(joinButton).toBeHidden();
  }
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
