import { test, expect } from '@playwright/test';

import {
  guild1,
  guildCreator1,
  player1,
  player2,
  player3,
  player4,
} from '../utilities/StoreMocks';

import {
  signInPage,
  gotoGuildPage,
  addRoleToMember,
  expectMemberHasRole
} from '../utilities/utility';

test.describe('Guild1 – Admin role assignment', () => {
  test.beforeEach(async ({ page }) => {
    await signInPage(guildCreator1, page);
    await gotoGuildPage(guild1, 'Admin', page);
  });

  test('Guild admin registers to quest', async ({ page }) => {
    const registerButton = page.getByRole('button', { name: 'Register' });

    await expect(registerButton).toBeVisible();
    await registerButton.click();

    const notification = page
      .locator('.q-notification')
      .filter({ hasText: /registered/i });

    await expect(notification).toBeVisible({ timeout: 5000 });
  });

  test('Guild admin removes Researcher and adds Game leader', async ({ page }) => {
    await addRoleToMember(page, guildCreator1.handle!, 'Game leader');
    await expectMemberHasRole(page, guildCreator1.handle!, 'Game leader');
  });

  test('Guild admin sets player1 to Researcher and Philosopher', async ({ page }) => {
    await addRoleToMember(page, player1.handle!, 'Philosopher');
    await expectMemberHasRole(page, player1.handle!, 'Researcher');
    await expectMemberHasRole(page, player1.handle!, 'Philosopher');
  });

  test('Guild admin removes Researcher and adds Critic for player2', async ({ page }) => {
    await addRoleToMember(page, player2.handle!, 'Critic');
    await expectMemberHasRole(page, player2.handle!, 'Critic');    
  });

  test('Guild admin keeps Researcher for player3', async ({ page }) => {
    await expectMemberHasRole(page, player3.handle!, 'Researcher');
  });

  test('Guild admin removes Researcher and adds Scribe for player4', async ({ page }) => {
    await addRoleToMember(page, player4.handle!, 'Scribe');
    await expectMemberHasRole(page, player4.handle!, 'Scribe');
  });
});
