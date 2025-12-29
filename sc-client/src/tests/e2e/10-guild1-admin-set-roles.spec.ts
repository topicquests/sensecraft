import { test, expect } from '@playwright/test';
import {
  guild1,
  guildCreator1,
  player1,
  player2,
  player3,
  player4,
  player5,
} from '../utilities/StoreMocks';
import {
  getRoleSelectByHandle,
  gotoGuildPage,
  signInPage,
} from '../utilities/utility';

test.describe('Guild admi  register to quest and set players roles', () => {
  test.beforeEach(async ({ page }) => {
    await signInPage(guildCreator1, page);
  });
  test('Guild admin register to quest', async ({ page }) => {
    await gotoGuildPage(guild1, 'Admin', page);
    await expect(page).toHaveURL(/.*guild\/\d+\/admin/);
    // Verify there is a register button
    const registerButton = page.getByRole('button', { name: 'Register' });
    await expect(registerButton).toBeVisible();
    //Register to quest
    await registerButton.click();
    await expect(
      page
        .getByRole('alert')
        .filter({ hasText: 'You have registered to Quest' }),
    ).toBeVisible();
  });
  test('Guild creator can go to create guild page', async ({ page }) => {
    await gotoGuildPage(guild1, 'Admin', page);
    await expect(page).toHaveURL(/.*guild\/\d+\/admin/);
  });
  test('Guild admin set guildCreator1 add Game leader', async ({ page }) => {
    await gotoGuildPage(guild1, 'Admin', page);
    await expect(page).toHaveURL(/.*guild\/\d+\/admin/);
    const qSelect = getRoleSelectByHandle(page, guildCreator1.handle!);
    await qSelect.click();
    const gameLeaderOption = page.locator('.q-menu .q-item', {
      hasText: 'Game leader',
    });
    await gameLeaderOption.click();
  });
  test('Guild admin set playerOne to Researcher, Philospher', async ({
    page,
  }) => {
    await gotoGuildPage(guild1, 'Admin', page);
    const qSelect = getRoleSelectByHandle(page, player1.handle!);
    await qSelect.click();
    const philosopherOption = page.locator('.q-menu .q-item', {
      hasText: 'Philosopher',
    });
    await philosopherOption.click();
  });
  test('Guild admin set playerTwo remove Researcher and add Critic', async ({
    page,
  }) => {
    await gotoGuildPage(guild1, 'Admin', page);
    const qSelect = getRoleSelectByHandle(page, player2.handle!);
    await qSelect.click();
    await page.waitForSelector('.q-menu');
    const removeResearcher = page.locator('.q-menu .q-item', {
      hasText: 'Researcher',
    });
    await removeResearcher.click();
    const addCritic = page.locator('.q-menu .q-item', { hasText: 'Critic' });
    await addCritic.click();
  });
  test('Guild admin set playerThree keep Researcher', async ({ page }) => {
    await gotoGuildPage(guild1, 'Admin', page);
    const qSelect = getRoleSelectByHandle(page, player3.handle!);
    await qSelect.click();
  });
  test('Guild admin set playerFour remove Researcher and add Scribe', async ({
    page,
  }) => {
    await gotoGuildPage(guild1, 'Admin', page);
    const qSelect = getRoleSelectByHandle(page, player4.handle!);
    await qSelect.click();
    await page.waitForSelector('.q-menu');
    const removeResearcher = page.locator('.q-menu .q-item', {
      hasText: 'Researcher',
    });
    await removeResearcher.click();
    const addScribe = page.locator('.q-menu .q-item', { hasText: 'Scribe' });
    await addScribe.click();
  });
});
