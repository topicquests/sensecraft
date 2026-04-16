import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GuildsTableComponent from '../../../components/guilds-table.vue';
import { createTestingPinia } from '@pinia/testing';
import { useGuildStore } from '../../../stores/guilds';
import {
  mockGuild,
  mockGuildMembership,
  mockQuest,
  mockMember,
} from '../../utilities/StoreMocks';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';

installQuasarPlugin();

function createWrapper(props = {}) {
  return mount(GuildsTableComponent, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            guild: {
              currentGuild: mockGuild.id,
              guilds: { 1: mockGuild },
            },
            quest: {
              currentQuest: mockQuest.id,
              quests: { 1: mockQuest },
            },
            member: {
              member: mockMember,
            },
          },
        }),
      ],
      stubs: {
        'guilds-playing-indicator': {
          template: '<div class="stubbed-playing-indicator"></div>',
        },
      },
    },
    props: {
      title: 'Guild Table Test',
      guilds: [mockGuild],
      quest: mockQuest,
      showPlayers: true,
      selectable: true,
      ...props,
    },
  });
}

describe('GuildsTableComponent', () => {
  beforeEach(() => {
    mockGuild.guild_membership = [mockGuildMembership];
  });

  it('renders the guilds table with the correct number of guild rows', () => {
    const wrapper = createWrapper();
    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBe(1);
  });

  it('renders guild names correctly', () => {
    const wrapper = createWrapper();
    const firstRowName = wrapper.find('tbody tr:first-child td:nth-child(3)');
    expect(firstRowName.text()).toContain('Test Guild');
  });

  it('shows the "Admin" link for guilds with admin permissions', () => {
    mockMember.permissions = ['guildAdmin'];
    const wrapper = createWrapper();
    const adminLink = wrapper.find('a[href="/guild/1/admin"]');
    expect(adminLink.exists()).toBe(true);
  });

  it('does not show the "Admin" link for guilds without admin permissions', () => {
    const wrapper = createWrapper();
    const secondRowAdminLink = wrapper.find(
      'tbody tr:nth-child(2) .admin-link',
    );
    expect(secondRowAdminLink.exists()).toBe(false); // No admin link for guild with ID 2
  });

  it('calls guildStore.setCurrentGuild when selectionChanged is triggered', async () => {
    const wrapper = createWrapper();
    const guildStore = useGuildStore();
    const setCurrentGuildSpy = vi.spyOn(guildStore, 'setCurrentGuild');
    const table = wrapper.findComponent({ name: 'QTable' });

    // Simulate the q-table emitting the 'selection' event
    const rowEvent = {
      rows: [{ id: 123 }],
      keys: [],
      added: true,
      evt: new Event('click'),
    };
    await table.vm.$emit('selection', rowEvent);
    expect(setCurrentGuildSpy).toHaveBeenCalledWith(123);
  });
});
