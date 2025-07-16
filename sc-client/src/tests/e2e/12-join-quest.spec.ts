import { test, expect } from '@playwright/test';
import { guild2, guildCreator2, mockQuest, player6, player7, player8, player9, player10 } from '../utilities/StoreMocks';
import { gotoGuildPage, signInPage } from '../utilities/utility';

test.describe('Player join quest from their guild', () => {
  test('GuildCreator2 join  quest', async ({page}) => {
    await signInPage(guildCreator2, page);
    await gotoGuildPage(guild2, 'View', page);

      // Locate the quest radio group by label
    const questRadio =  page.getByRole('radio', { name: mockQuest.name });

    // Select the quest
    await questRadio.check();

    // Find the Play button *within* the same quest container
    const questContainer =  questRadio.locator('..');
    const playButton = questContainer.getByRole('button', { name: 'Play' });

    // Click the Play button
    await playButton.click();

    // Assert that a dialog appeared
    await expect(page.locator('[data-test="register-dialog"]')).toBeVisible();

    // Find and select the radio button labeled "Game leader"
    const gameLeaderRadio = page.getByRole('radio', { name: 'Game leader' });
    await gameLeaderRadio.check();
  });
  test('Player6 join  quest', async ({page}) => {
    await signInPage(player6, page);
    await gotoGuildPage(guild2, 'View', page);

      // Locate the quest radio group by label
    const questRadio =  page.getByRole('radio', { name: mockQuest.name });

    // Select the quest
    await questRadio.check();

    // Find the Play button *within* the same quest container
    const questContainer =  questRadio.locator('..');
    const playButton = questContainer.getByRole('button', { name: 'Play' });

    // Click the Play button
    await playButton.click();

    // Assert that a dialog appeared
    await expect(page.locator('[data-test="register-dialog"]')).toBeVisible();

    // Find and select the radio button labeled "Game leader"
    const gameLeaderRadio = page.getByRole('radio', { name: 'Philosopher' });
    await gameLeaderRadio.check();
  });
  test('Player7 join  quest', async ({page}) => {
    await signInPage(player7, page);
    await gotoGuildPage(guild2, 'View', page);

      // Locate the quest radio group by label
    const questRadio =  page.getByRole('radio', { name: mockQuest.name });

    // Select the quest
    await questRadio.check();

    // Find the Play button *within* the same quest container
    const questContainer =  questRadio.locator('..');
    const playButton = questContainer.getByRole('button', { name: 'Play' });

    // Click the Play button
    await playButton.click();

    // Assert that a dialog appeared
    await expect(page.locator('[data-test="register-dialog"]')).toBeVisible();

    // Find and select the radio button labeled "Game leader"
    const gameLeaderRadio = page.getByRole('radio', { name: 'Critic' });
    await gameLeaderRadio.check();
  });
  test('Player8 join  quest', async ({page}) => {
    await signInPage(player8, page);
    await gotoGuildPage(guild2, 'View', page);

      // Locate the quest radio group by label
    const questRadio =  page.getByRole('radio', { name: mockQuest.name });

    // Select the quest
    await questRadio.check();

    // Find the Play button *within* the same quest container
    const questContainer =  questRadio.locator('..');
    const playButton = questContainer.getByRole('button', { name: 'Play' });

    // Click the Play button
    await playButton.click();

    // Assert that a dialog appeared
    await expect(page.locator('[data-test="register-dialog"]')).toBeVisible();

    // Find and select the radio button labeled "Game leader"
    const gameLeaderRadio = page.getByRole('radio', { name: 'Researcher' });
    await gameLeaderRadio.check();
  });
  test('Player9 join  quest', async ({page}) => {
    await signInPage(player9, page);
    await gotoGuildPage(guild2, 'View', page);

      // Locate the quest radio group by label
    const questRadio =  page.getByRole('radio', { name: mockQuest.name });

    // Select the quest
    await questRadio.check();

    // Find the Play button *within* the same quest container
    const questContainer =  questRadio.locator('..');
    const playButton = questContainer.getByRole('button', { name: 'Play' });

    // Click the Play button
    await playButton.click();

    // Assert that a dialog appeared
    await expect(page.locator('[data-test="register-dialog"]')).toBeVisible();

    // Find and select the radio button labeled "Game leader"
    const gameLeaderRadio = page.getByRole('radio', { name: 'Scribe' });
    await gameLeaderRadio.check();
  });
  test('Player10 join  quest', async ({page}) => {
    await signInPage(player10, page);
    await gotoGuildPage(guild2, 'View', page);

      // Locate the quest radio group by label
    const questRadio =  page.getByRole('radio', { name: mockQuest.name });

    // Select the quest
    await questRadio.check();

    // Find the Play button *within* the same quest container
    const questContainer =  questRadio.locator('..');
    const playButton = questContainer.getByRole('button', { name: 'Play' });

    // Click the Play button
    await playButton.click();

    // Assert that a dialog appeared
    await expect(page.locator('[data-test="register-dialog"]')).toBeVisible();

    // Find and select the radio button labeled "Game leader"
    const gameLeaderRadio = page.getByRole('radio', { name: 'Researcher' });
    await gameLeaderRadio.check();
  });
});
