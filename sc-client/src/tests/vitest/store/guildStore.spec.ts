import AxiosMockAdapter from 'axios-mock-adapter';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { useGuildStore } from 'src/stores/guilds';
import { api } from 'src/boot/axios';
import {
  mockGuild,
  mockGuildMembership,
  mockGuildMemberAvailableRole,
  mockMember,
  mockQuest,
} from '../../utilities/StoreMocks';
import { setActivePinia, createPinia } from 'pinia';
import { useMemberStore } from 'src/stores/member';
import { useMembersStore } from 'src/stores/members';
import { GuildMemberAvailableRole } from 'src/types';

let guildStore: ReturnType<typeof useGuildStore>;
let memberStore: ReturnType<typeof useMemberStore>;
let membersStore: ReturnType<typeof useMembersStore>;
const mockAxios = new AxiosMockAdapter(api, { delayResponse: 0 });

vi.mock('src/stores/member', () => ({
  useMemberStore: () => ({
    getUserId: 1,
    member: mockMember,
  }),
}));
vi.mock('src/stores/members', () => ({
  useMembersStore: () => ({
    members: { [mockMember.id]: mockMember },
  }),
}));
vi.mock('src/stores/quests', () => ({
  useQuestStore: () => ({
    currentQuest: mockQuest,
    quests: mockQuest,
    getCastingRolesById: vi.fn(() => []),
    getCurrentQuest: mockQuest,
    deleteCastingRole: vi.fn(),
  }),
}));

describe('GuildStore - testing of guilds store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    guildStore = useGuildStore();
    memberStore = useMemberStore();
    membersStore = useMembersStore();
    guildStore.guilds = [];
    memberStore.member = undefined;
    membersStore.members = [];
  });
  afterEach(() => {
    mockAxios.reset();
  });
  it('Test getters', () => {
    const guildStore = useGuildStore();
    memberStore.member = mockMember;
    guildStore.guilds = {
      1: mockGuild,
    };
    mockGuild.guild_membership.push(mockGuildMembership);
    guildStore.currentGuild = 1;
    expect(guildStore.getCurrentGuild).toEqual(mockGuild);
    expect(guildStore.getGuilds).toEqual([mockGuild]);
    expect(guildStore.getGuildById(1)).toEqual(mockGuild);
    expect(guildStore.getMyGuilds).toEqual([mockGuild]);
    expect(guildStore.isGuildMember(1)).toEqual(mockGuildMembership);
    expect(guildStore.getGuildMembershipById(1)).toEqual(mockGuildMembership);
    expect(guildStore.getMembersOfCurrentGuild).toEqual([mockMember]);
    expect(guildStore.getGuildsPlayingCurrentQuest).toEqual([mockGuild]);
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
      const requestedId = config.params?.id?.replace('eq.', '');
      if (requestedId === '999') {
        return [200, []];
      }
    });
    const result = await guildStore.fetchGuildsById(id);
    expect(result).toEqual([]);
    expect(guildStore.guilds[id]).toBeUndefined();
  });
  it('creates a new guild successfully', async () => {
    const newGuildData = {
      name: 'New Guild',
      description: 'A freshly created guild',
    };

    const mockCreatedGuild = {
      ...mockGuild,
      ...newGuildData,
      id: 3,
      member_count: 1,
      member_request_count: 0,
      is_member: true,
      is_admin: true,
      last_node_published_at: '',
      node_count: 0,
      ongoing_quests_count: 0,
      finished_quests_count: 0,
      recruiting_for_quest_count: 0,
    };

    mockAxios.onPost('/guilds').reply(201, [mockCreatedGuild]);
    const result = await guildStore.createGuildBase(newGuildData);
    expect(result.status).toBe(201);
    expect(result.data).toEqual([mockCreatedGuild]);
    expect(guildStore.guilds[mockCreatedGuild.id]).toEqual(mockCreatedGuild);
    expect(guildStore.fullGuilds[mockCreatedGuild.id]).toBe(false);
  });

  it('handles API error when creating a guild', async () => {
    const newGuildData = { name: 'Failed Guild' };
    mockAxios.onPost('/guilds').reply(500, { error: 'Internal Server Error' });

    await expect(guildStore.createGuildBase(newGuildData)).rejects.toThrow(
      'Request failed with status code 500',
    );
    expect(guildStore.guilds[3]).toBeUndefined();
  });
  it('updates a guild successfully', async () => {
    const updatedData = { id: mockGuild.id, name: 'Updated Guild Name' };
    const mockUpdatedGuild = { ...mockGuild, ...updatedData };
    mockAxios.onPatch('guilds', updatedData).reply(200, [mockUpdatedGuild]);
    await guildStore.updateGuild(updatedData);
    expect(guildStore.guilds[mockGuild.id]).toEqual(mockUpdatedGuild);
  });

  it('does not modify guild data on unsuccessful update (404)', async () => {
    guildStore.guilds = { [mockGuild.id]: mockGuild };
    const updatedData = { id: mockGuild.id, name: 'Nonexistent Guild' };
    mockAxios.onPatch('guilds', updatedData).reply(404, { error: 'Not Found' });
    await expect(guildStore.updateGuild(updatedData)).rejects.toThrow(
      'Request failed with status code 404',
    );
    expect(guildStore.guilds[mockGuild.id]).toEqual(mockGuild);
  });
  it('handles API error gracefully', async () => {
    guildStore.guilds = { [mockGuild.id]: mockGuild };
    const updatedData = { id: mockGuild.id, name: 'Error Guild' };
    mockAxios.onPatch('guilds', updatedData).reply(500);
    await expect(guildStore.updateGuild(updatedData)).rejects.toThrow();
    expect(guildStore.guilds[mockGuild.id]).toEqual(mockGuild);
  });
  it('does nothing if no guild ID is provided', async () => {
    guildStore.guilds = { [mockGuild.id]: mockGuild };
    const updatedData = { name: 'Invalid Update' };
    mockAxios.onPatch('guilds', updatedData).reply(404, { error: 'No id ' });
    await expect(guildStore.updateGuild(updatedData)).rejects.toThrow(
      'Request failed with status code 404',
    );
    expect(guildStore.guilds).toEqual({ [mockGuild.id]: mockGuild });
  });
  it('Add guild membership', async () => {
    guildStore.guilds = { [mockGuild.id]: mockGuild };
    const guildMembership = mockGuildMembership;
    mockAxios.onPost('guild_membership').reply(201, [mockGuildMembership]);
    const result = await guildStore.doAddGuildMembership(guildMembership);
    const updatedGuild = guildStore.guilds[mockGuild.id];
    expect(updatedGuild.guild_membership).toContainEqual(mockGuildMembership);
  });
  it('handles API error gracefully for doAddGuildMembership', async () => {
    const guildMembership = mockGuildMembership;
    mockAxios
      .onPost('guild_membership')
      .reply(500, { error: 'Internal Server Error' });
    await expect(
      guildStore.doAddGuildMembership(guildMembership),
    ).rejects.toThrow('Request failed with status code 500');
  });
  it('Add guild member available role', async () => {
    memberStore.member = mockMember;
    mockAxios
      .onPost('/guild_member_available_role')
      .reply(201, [mockGuildMemberAvailableRole]);
    await guildStore.addGuildMemberAvailableRole(mockGuildMemberAvailableRole);
    expect(memberStore.member.guild_member_available_role).toContainEqual(
      mockGuildMemberAvailableRole,
    );
  });
  it('members id does not match', async () => {
    memberStore.member = mockMember;
    mockGuildMemberAvailableRole.member_id = 2;
    mockAxios
      .onPost('/guild_member_available_role')
      .reply(500, { error: 'Internal Server Error' });
    await expect(
      guildStore.addGuildMemberAvailableRole(mockGuildMemberAvailableRole),
    ).rejects.toThrow('Request failed with status code 500');
  });
  it('deletes guild member available role successfully', async () => {
    memberStore.member = { ...mockMember };
    const roleToDelete: GuildMemberAvailableRole = {
      member_id: mockMember.id,
      guild_id: mockGuild.id,
      role_id: 4,
    };
    memberStore.member.guild_member_available_role.push(roleToDelete);
    mockAxios
      .onDelete('/guild_member_available_role', {
        params: {
          member_id: `eq.${roleToDelete.member_id}`,
          guild_id: `eq.${roleToDelete.guild_id}`,
          role_id: `eq.${roleToDelete.role_id}`,
        },
      })
      .reply(200, [roleToDelete]);
    await guildStore.deleteGuildMemberAvailableRole(roleToDelete);
    expect(
      memberStore.member.guild_member_available_role.some(
        (role) =>
          role.role_id === roleToDelete.role_id &&
          role.member_id === roleToDelete.member_id &&
          role.guild_id === roleToDelete.guild_id,
      ),
    ).toBe(false);
    expect(mockAxios.history.delete.length).toBe(1);
    expect(mockAxios.history.delete[0].url).toBe(
      '/guild_member_available_role',
    );
    expect(mockAxios.history.delete[0].params).toEqual({
      member_id: `eq.${roleToDelete.member_id}`,
      guild_id: `eq.${roleToDelete.guild_id}`,
      role_id: `eq.${roleToDelete.role_id}`,
    });
  });
  it('does not remove role if API response is empty', async () => {
    memberStore.member = { ...mockMember };
    const roleToDelete: GuildMemberAvailableRole = {
      member_id: mockMember.id,
      guild_id: mockGuild.id,
      role_id: 4,
    };
    memberStore.member.guild_member_available_role.push(roleToDelete);

    mockAxios.onDelete('/guild_member_available_role').reply(500, []);
    await expect(
      guildStore.deleteGuildMemberAvailableRole(roleToDelete),
    ).rejects.toThrow('Request failed with status code 500');
    expect(
      memberStore.member.guild_member_available_role.some(
        (role) =>
          role.role_id === roleToDelete.role_id &&
          role.member_id === roleToDelete.member_id &&
          role.guild_id === roleToDelete.guild_id,
      ),
    ).toBe(true);
  });
});
