import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import QuestAction from '../../../components/quest-actions.vue';
import { createTestingPinia } from '@pinia/testing';
import {
  mockQuest,
  mockMember,
  mockGuild,
  mockGuildMembership,
  mockQuestMembership,
  mockCasting,
  mockGamePlay,
} from '../../utilities/StoreMocks';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';

installQuasarPlugin();
const initialMockGuild = JSON.parse(JSON.stringify(mockGuild));
const initialMockMember = JSON.parse(JSON.stringify(mockMember));
const initialMockQuest = JSON.parse(JSON.stringify(mockQuest));
const initialMockCasting = JSON.parse(JSON.stringify(mockCasting));
const initialMockGuildMembership = JSON.parse(
  JSON.stringify(mockGuildMembership),
);
const initialMockQuestMembership = JSON.parse(
  JSON.stringify(mockQuestMembership),
);
const initialMockGamePlay = JSON.parse(JSON.stringify(mockGamePlay));
describe('QuestAction Component', () => {
  beforeEach(() => {});
  afterEach(() => {
    Object.assign(mockGuild, JSON.parse(JSON.stringify(initialMockGuild)));
    Object.assign(
      mockGuildMembership,
      JSON.parse(JSON.stringify(initialMockGuildMembership)),
    );
    Object.assign(mockMember, JSON.parse(JSON.stringify(initialMockMember)));
    Object.assign(mockQuest, JSON.parse(JSON.stringify(initialMockQuest)));
    Object.assign(mockCasting, JSON.parse(JSON.stringify(initialMockCasting)));
    Object.assign(
      mockQuestMembership,
      JSON.parse(JSON.stringify(initialMockQuestMembership)),
    );
    Object.assign(mockGamePlay, JSON.parse(JSON.stringify(initialMockGamePlay)));
  });

  it('renders login prompt when user is not logged in', () => {
    mockMember.id = null;
    const wrapper = mount(QuestAction, {
      props: {
        questId: mockQuest.id,
        myPlayingGuilds: [mockGuild],
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              quest: {
                quests: { 1: mockQuest },
                currentQuest: mockQuest.id,
              },
              guilds: {
                guilds: { 1: mockGuild },
              },
              member: {
                member: mockMember,
              },
            },
          }),
        ],
      },
    });
    expect(wrapper.text()).toContain('Login to play');
  });
  it('renders quest administration link when user is quest member', () => {
    mockQuest.quest_membership = [mockQuestMembership];
    const wrapper = mount(QuestAction, {
      props: {
        questId: mockQuest.id,
        myPlayingGuilds: [mockGuild],
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              quest: {
                quests: { 1: mockQuest },
                currentQuest: mockQuest.id,
              },
              guilds: {
                guilds: { 1: mockGuild },
              },
              member: {
                member: mockMember,
              },
            },
          }),
        ],
      },
    });
    expect(wrapper.text()).toContain('administer');
  });
  it("shows You're playing in guild if the user is playing in a guild", () => {
    mockQuestMembership.member_id = null;
    mockMember.casting = [mockCasting];
    const wrapper = mount(QuestAction, {
      props: {
        questId: mockQuest.id,
        myPlayingGuilds: [mockGuild],
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              quest: {
                quests: { 1: mockQuest },
                currentQuest: mockQuest.id,
              },
              guilds: {
                guilds: { 1: mockGuild },
              },
              member: {
                member: mockMember,
              },
            },
          }),
        ],
      },
    });
    expect(wrapper.text()).toContain(`You're playing in guild`);
  });
  it('Show the game has started if not in registration status', () => {
    mockQuestMembership.member_id = null;
    mockMember.casting = undefined;
    const wrapper = mount(QuestAction, {
      props: {
        questId: mockQuest.id,
        myPlayingGuilds: [mockGuild],
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              quest: {
                quests: { 1: mockQuest },
                currentQuest: mockQuest.id,
              },
              guilds: {
                guilds: { 1: mockGuild },
              },
              member: {
                member: mockMember,
              },
            },
          }),
        ],
      },
    });
    expect(wrapper.text()).toContain('The game has started');
  });
  it('shows Your guild is playing and join button when user has one playing guild and game is in registration', async () => {
    mockQuestMembership.member_id = null;
    mockMember.casting = undefined;
    mockQuest.status = 'registration';
    mockGuildMembership.permissions = ['joinQuest'];
    const wrapper = mount(QuestAction, {
      props: {
        questId: mockQuest.id,
        myPlayingGuilds: [mockGuild],
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              quest: {
                quests: { 1: mockQuest },
                currentQuest: mockQuest.id,
              },
              guilds: {
                guilds: { 1: mockGuild },
              },
              member: {
                member: mockMember,
              },
            },
          }),
        ],
      },
    });
    expect(wrapper.text()).toContain(
      `Your guild ${mockGuild.name} is playing!`,
    );
    const joinButton = wrapper.find('button');
    expect(joinButton.exists()).toBe(true);
    expect(joinButton.text()).toBe('Join the game');
  });
  it('shows multiple guilds when user is part of more than one playing guild', () => {
    mockQuestMembership.member_id = null;
    mockMember.casting = undefined;
    mockQuest.status = 'registration';
    mockGuildMembership.permissions = [];
    const mockGuild2 = { ...mockGuild };
    mockGuild2.id = 2;
    mockGuild2.name = 'Test 2';
    const wrapper = mount(QuestAction, {
      props: {
        questId: mockQuest.id,
        myPlayingGuilds: [mockGuild, mockGuild2],
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              quest: {
                quests: { 1: mockQuest },
                currentQuest: mockQuest.id,
              },
              guilds: {
                guilds: [{ 1: mockGuild }],
              },
              member: {
                member: mockMember,
              },
            },
          }),
        ],
      },
    });
    expect(wrapper.text()).toContain(
      'You are part of many guilds which are playing this quest. Pick one:',
    );
    expect(wrapper.text()).toContain('GuildTest');
    expect(wrapper.text()).toContain('GuildTest');
  });
  it('displays guild leadership options when user is a leader a guild', () => {
    mockQuestMembership.member_id = null;
    mockMember.casting = undefined;
    mockQuest.status = 'registration';
    mockGuildMembership.permissions = ['joinQuest'];
    mockGuild.guild_membership = [mockGuildMembership];
    mockMember.guild_membership = [mockGuildMembership];
    const wrapper = mount(QuestAction, {
      props: {
        questId: mockQuest.id,
        myPlayingGuilds: undefined,
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              quest: {
                quests: { 1: mockQuest },
                currentQuest: mockQuest.id,
              },
              guild: {
                guilds: { 1: mockGuild },
              },
              member: {
                member: mockMember,
              },
            },
          }),
        ],
      },
    });
    expect(wrapper.text()).toContain(`You are a leader in ${mockGuild.name}`);
  });
  it('displays guild leadership options when user is a leader in multible guilds', () => {
    mockQuestMembership.member_id = null;
    mockMember.casting = undefined;
    mockQuest.status = 'registration';
    const mockGuild2 = { ...mockGuild };
    mockGuild2.id = 2;
    mockGuild2.name = 'Test 2';
    const mockGuildMembership2 = { ...mockGuildMembership };
    mockGuildMembership2.guild_id = 2;
    mockGuild2.guild_membership = [mockGuildMembership2];
    mockGuildMembership.permissions = ['joinQuest'];
    mockGuild.guild_membership = [mockGuildMembership];
    mockGuild2.guild_membership = [mockGuildMembership];
    mockMember.guild_membership = [mockGuildMembership, mockGuildMembership2];
    const wrapper = mount(QuestAction, {
      props: {
        questId: mockQuest.id,
        myPlayingGuilds: undefined,
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              quest: {
                quests: { 1: mockQuest },
                currentQuest: mockQuest.id,
              },
              guild: {
                guilds: { 1: mockGuild, 2: mockGuild },
              },
              member: {
                member: mockMember,
              },
            },
          }),
        ],
      },
    });
    expect(wrapper.text()).toContain(`You are a leader in many guilds`);
  });
  it('displays guild leadership options when user is a leader in multible guilds', () => {
    mockQuestMembership.member_id = null;
    mockMember.casting = undefined;
    mockQuest.status = 'registration';
    mockGuildMembership.permissions = [];
    mockGuild.guild_membership = [mockGuildMembership];
    mockMember.guild_membership = [mockGuildMembership];
    const wrapper = mount(QuestAction, {
      props: {
        questId: mockQuest.id,
        myPlayingGuilds: undefined,
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              quest: {
                quests: { 1: mockQuest },
                currentQuest: mockQuest.id,
              },
              guild: {
                guilds: { 1: mockGuild },
              },
              member: {
                member: mockMember,
              },
            },
          }),
        ],
      },
    });
    expect(wrapper.text()).toContain(
      `You could tell the guild leader to join this quest!`,
    );
  });
  it('displays you are a member of a guild request join quest', () => {
    mockQuestMembership.member_id = null;
    mockMember.casting = undefined;
    mockQuest.status = 'registration';
    mockGuildMembership.permissions = [];
    mockGuild.guild_membership = [mockGuildMembership];
    mockMember.guild_membership = [mockGuildMembership];
    const wrapper = mount(QuestAction, {
      props: {
        questId: mockQuest.id,
        myPlayingGuilds: undefined,
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              quest: {
                quests: { 1: mockQuest },
                currentQuest: mockQuest.id,
              },
              guild: {
                guilds: { 1: mockGuild },
              },
              member: {
                member: mockMember,
              },
            },
          }),
        ],
      },
    });
    expect(wrapper.text()).toContain(
      `You could tell the guild leader to join this quest!`,
    );
  });
  it('displays you are a member of multiple guilds request join quest', () => {
    mockGuildMembership.permissions = [];
    const mockGuild2 = { ...mockGuild };
    const mockGuildMembership2 = { ...mockGuildMembership };
    mockQuestMembership.member_id = null;
    mockMember.casting = undefined;
    mockQuest.status = 'registration';
    mockGuild.guild_membership = [mockGuildMembership];
    mockMember.guild_membership = [mockGuildMembership, mockGuildMembership2];
    const wrapper = mount(QuestAction, {
      props: {
        questId: mockQuest.id,
        myPlayingGuilds: undefined,
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              quest: {
                quests: { 1: mockQuest },
                currentQuest: mockQuest.id,
              },
              guild: {
                guilds: { 1: mockGuild, 2: mockGuild2 },
              },
              member: {
                member: mockMember,
              },
            },
          }),
        ],
      },
    });
    expect(wrapper.text()).toContain(
      'You could tell the guild leader in one of them to join this quest!',
    );
  });
  it('displays guilds you can join', () => {
    mockGuildMembership.permissions = [];
    mockQuestMembership.member_id = null;
    mockMember.casting = undefined;
    mockQuest.status = 'registration';
    const mockGuild2 = { ...mockGuild };
    const mockGamePlay2 = { ...mockGamePlay };
    mockGamePlay2.guild_id = 2;
    mockQuest.game_play.push(mockGamePlay2);
    mockGuild2.open_for_applications = true;
    mockGuild.open_for_applications = true;
    const wrapper = mount(QuestAction, {
      props: {
        questId: mockQuest.id,
        myPlayingGuilds: undefined,
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              quest: {
                quests: { 1: mockQuest },
                currentQuest: mockQuest.id,
              },
              guild: {
                guilds: { 1: mockGuild, 2: mockGuild2 },
              },
              member: {
                member: mockMember,
              },
            },
          }),
        ],
      },
    });
    expect(wrapper.text()).toContain(
      'Here are guilds playing the game which you could join:',
    );
  });
  it('displays error if none of the previous test fit', () => {
    mockGuildMembership.permissions = [];
    mockQuestMembership.member_id = null;
    mockMember.casting = undefined;
    mockQuest.status = 'registration';
    const wrapper = mount(QuestAction, {
      props: {
        questId: mockQuest.id,
        myPlayingGuilds: undefined,
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              quest: {
                quests: { 1: mockQuest },
                currentQuest: mockQuest.id,
              },
              guild: {
                guilds: { 1: mockGuild },
              },
              member: {
                member: mockMember,
              },
            },
          }),
        ],
      },
    });
    expect(wrapper.text()).toContain('error');
  });
});
