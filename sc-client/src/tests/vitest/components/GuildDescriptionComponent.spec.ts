import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import GuildDescriptionComponent from '../../../components/guild-description.vue'; // Replace with your component path
import { createTestingPinia } from '@pinia/testing';
import { useGuildStore } from '../../../stores/guilds';
import { mockGuild, mockMember } from '../../utilities/StoreMocks';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { useMemberStore } from 'src/stores/member';

installQuasarPlugin();
describe('GuildDescriptionComponent', () => {
  let guildStore;
  let memberStore;
  it('renders join to guild button', async () => {
    mockGuild.open_for_applications = true;
    const wrapper = mount(GuildDescriptionComponent, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              guild: {
                fullFetch: false,
                fullGuilds: {},
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
    const joinBtn = wrapper.findComponent({ name: 'QBtn' });
    expect(joinBtn.exists()).toBe(true);
    expect(joinBtn.text()).toBe('Join Guild');
  });

  it('does not render join button when not open for applications', async () => {
    const closedGuild = { ...mockGuild, open_for_applications: false };
    const wrapper = mount(GuildDescriptionComponent, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              guild: {
                fullFetch: false,
                fullGuilds: {},
                guilds: { 1: closedGuild },
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
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('guild closed');
  });

  it('renders login/register message when no member and open for applications', async () => {
    const openGuild = { ...mockGuild, open_for_applications: true };
    const wrapper = mount(GuildDescriptionComponent, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              guild: {
                guilds: { 1: openGuild },
                currentGuild: 1,
              },
              member: {
                member: undefined,
              },
            },
          }),
        ],
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('span').text()).toBe('login or register to join');
  });
});
