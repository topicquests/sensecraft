import AxiosMockAdapter from 'axios-mock-adapter';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { useGuildStore } from 'src/stores/guilds';
import { api } from 'src/boot/axios';
import { mockGuild } from '../components/mocks/StoreMocks';
import { setActivePinia, createPinia } from 'pinia';

let guildStore: ReturnType<typeof useGuildStore>;
const mockAxios = new AxiosMockAdapter(api, { delayResponse: 0 });

vi.mock('src/stores/member', () => ({
  useMemberStore: () => ({
    getUserId: 1,
  }),
}));

describe('GuildStore - fetchGuildsById', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    guildStore = useGuildStore();
  });
  afterEach(() => {
    mockAxios.reset();
  });

  it('fetches the guild by its id', async () => {
    const id = mockGuild.id;
    mockAxios.onGet('/guilds_data').reply((config) => {
      if (config.params?.id === `eq.${id}`) {
        return [200, [mockGuild]];
      }
      return [404];
    });

    const result = await guildStore.fetchGuildsById(id);
    expect(result).toEqual([mockGuild]);
    expect(guildStore.guilds[id]).toEqual(mockGuild);
  });

  it('fetches multiple guilds by their IDs', async () => {
    const mockGuilds = [mockGuild, { ...mockGuild, id: 2 }];

    mockAxios.onGet('/guilds_data').reply((config) => {
      if (config.params?.id === 'in.(1,2)') {
        return [200, mockGuilds];
      }
      return [404];
    });
    const result = await guildStore.fetchGuildsById([1, 2]);
    expect(result).toEqual(mockGuilds);
    expect(guildStore.guilds[1]).toEqual(mockGuild);
    expect(guildStore.guilds[2]).toEqual(mockGuilds[1]);
  });
  it('returns an empty array if API response is unsuccessful (404)', async () => {
      const id = 999;
      mockAxios.onGet('/guilds_data').reply((config) => {
        const requestedId = config.params?.id?.replace('eq.', '')
        if (requestedId === '999') {
          console.log("Params ", config.params)
          console.log('Returning 404 for non-existent ID');
          return [404];
        }
        return [200, [mockGuild]];
      });
      const result = await guildStore.fetchGuildsById(id);
      expect(result).toEqual([]);
      expect(guildStore.guilds[id]).toBeUndefined();
    });
});
