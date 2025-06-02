import { test, expect } from '@playwright/test';
import { guild1, guildCreator1, mockQuest, player1, player2, player3, player4, player5 } from '../utilities/StoreMocks';
import { gotoGuildPage, signInPage } from '../utilities/utility';

test.describe('Player join quest from their guild', () => {
  test('GuildCreator1 join  quest', async ({page}) => {
    await signInPage(guildCreator1, page);
    await gotoGuildPage(guild1, 'View', page);

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
  test('Player1 join  quest', async ({page}) => {
    await signInPage(player1, page);
    await gotoGuildPage(guild1, 'View', page);

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
  test('Player2 join  quest', async ({page}) => {
    await signInPage(player2, page);
    await gotoGuildPage(guild1, 'View', page);

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
  test('Player3 join  quest', async ({page}) => {
    await signInPage(player3, page);
    await gotoGuildPage(guild1, 'View', page);

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
  test('Player4 join  quest', async ({page}) => {
    await signInPage(player4, page);
    await gotoGuildPage(guild1, 'View', page);

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
  test('Player5 join  quest', async ({page}) => {
    await signInPage(player5, page);
    await gotoGuildPage(guild1, 'View', page);

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
