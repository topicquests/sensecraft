import { test, expect } from '@playwright/test';
import {
  guild2,
  guildCreator2,
  player6,
  player7,
  player8,
  player9,
} from '../utilities/StoreMocks';

import {
  signInPage,
  gotoGuildPage,
  addRoleToMember,
  expectMemberHasRole
} from '../utilities/utility';

test.describe('Guild2 – Admin role assignment', () => {
  test.beforeEach(async ({ page }) => {
    await signInPage(guildCreator2, page);
    await gotoGuildPage(guild2, 'Admin', page);
  });

  test('Guild admin registers to quest', async ({ page }) => {
    const registerButton = page.getByRole('button', { name: 'Register' });
    await expect(registerButton).toBeVisible();
    await registerButton.click();

    const notification = page.locator('.q-notification').filter({
      hasText: /registered/i
    });
    await expect(notification).toBeVisible({ timeout: 5000 });
  });

  test('Guild admin removes Researcher and adds Game leader', async ({ page }) => {   
    await addRoleToMember(page, guildCreator2.handle!, 'Game leader');
    await expectMemberHasRole(page, guildCreator2.handle!, 'Game leader');
  });

  test('Guild admin sets player6 to Researcher and Philosopher', async ({ page }) => {
    await addRoleToMember(page, player6.handle!, 'Philosopher');
    await expectMemberHasRole(page, player6.handle!, 'Researcher');
    await expectMemberHasRole(page, player6.handle!, 'Philosopher');
  });

  test('Guild admin removes Researcher and adds Critic for player7', async ({ page }) => {
    await addRoleToMember(page, player7.handle!, 'Critic');
    await expectMemberHasRole(page, player7.handle!, 'Critic');
  });

  test('Guild admin keeps Researcher for player8', async ({ page }) => {
    await expectMemberHasRole(page, player8.handle!, 'Researcher');
  });

  test('Guild admin removes Researcher and adds Scribe for player9', async ({ page }) => {
    await addRoleToMember(page, player9.handle!, 'Scribe');
    await expectMemberHasRole(page, player9.handle!, 'Scribe');
    await expectMemberHasRole(page, player9.handle!, 'Researcher');
  });
});
