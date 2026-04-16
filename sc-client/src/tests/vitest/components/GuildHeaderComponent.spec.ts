import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import GuildHeaderComponent from '../../../components/guild-header.vue';
import { mockGuild, mockMember } from '../../utilities/StoreMocks';

describe('GuildHeaderComponent', () => {
  it('renders guild-header component', async () => {
    mockMember.permissions = ['joinQuest'];
    const wrapper = mount(GuildHeaderComponent, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              guild: {
                guilds: { 1: mockGuild },
                currentGuild: 1,
              },
              member: {
                member: mockMember,
              },
            },
          }),
        ],
      },
    });
    const routerLink = wrapper.find('a');
    expect(routerLink.exists()).toBe(true);
    expect(routerLink.text()).toContain('admin page');
  });
});
