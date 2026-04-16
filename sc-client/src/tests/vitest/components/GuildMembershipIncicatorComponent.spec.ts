import { describe, expect, it, afterEach } from 'vitest';
import guildsMembershipIndicatorComponent from 'src/components/guilds-membership-indicator.vue';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mockGuild, mockGuildMembership, mockMember } from '../../utilities/StoreMocks';
import { registration_status_enum } from '../../../enums';

const initialMockGuild = JSON.parse(JSON.stringify(mockGuild));
const initialMockGuildMembership = JSON.parse(
  JSON.stringify(mockGuildMembership),
);

describe('GuildMembershipIndicatorComponent', () => {
  afterEach(() => {
    Object.assign(mockGuild, JSON.parse(JSON.stringify(initialMockGuild)));
    Object.assign(
      mockGuildMembership,
      JSON.parse(JSON.stringify(initialMockGuildMembership)),
    );
  });
  it('show Member if isGuildMember', () => {
    mockGuildMembership.status = registration_status_enum.confirmed;
    mockGuild.guild_membership.push(mockGuildMembership);
    const wrapper = mount(guildsMembershipIndicatorComponent, {
      props: {
        guild: mockGuild,
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
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
    expect(wrapper.text()).toContain('Member');
  });
  it('show Open if open_for_application is true', () => {
    mockGuildMembership.status = registration_status_enum.confirmed;
    mockGuild.open_for_applications = true;
    const wrapper = mount(guildsMembershipIndicatorComponent, {
      props: {
        guild: mockGuild,
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
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
    expect(wrapper.text()).toContain('Open');
  });
  it('show Close if open_for_application is false', () => {
    mockGuildMembership.status = registration_status_enum.confirmed;
    mockGuild.open_for_applications = false;
    const wrapper = mount(guildsMembershipIndicatorComponent, {
      props: {
        guild: mockGuild,
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
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
    expect(wrapper.text()).toContain('Close');
  });
});
