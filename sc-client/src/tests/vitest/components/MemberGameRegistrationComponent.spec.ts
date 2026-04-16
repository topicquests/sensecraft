import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import memberGameRegistrationComponent from '../../../components/member_game_registration.vue';
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { mockGuild, mockMember, mockQuest, mockRole } from '../../utilities/StoreMocks';
import { createTestingPinia } from '@pinia/testing';
import { useRoleStore } from 'src/stores/role';

installQuasarPlugin();

describe('memberGameRegistrationComponent', () => {
  it('no available roles for member', () => {
    const wrapper = mount(memberGameRegistrationComponent, {
      props: {
        questId: mockQuest.id,
        guildId: mockGuild.id,
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              role: {
                role: {},
              },
              members: {
                members: { [mockMember.id]: mockMember },
                availableRoles: [], // No available roles for the member
              },
              member: {
                member: mockMember,
              },
            },
          }),
        ],
      },
    });

    // Access the role store to verify it has no roles
    const roleStore = useRoleStore();
    expect(roleStore.getRoles).toHaveLength(0); // Expect no roles available
    // Assert the DOM reflects that no roles are available (e.g., no options shown)
    expect(wrapper.html()).toContain('ask');
  });
  it('available roles for member', () => {
    mockMember.guild_member_available_role.push({
      guild_id: 1,
      member_id: 1,
      role_id: 1,
    });
    const wrapper = mount(memberGameRegistrationComponent, {
      props: {
        questId: mockQuest.id,
        guildId: mockGuild.id,
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              role: {
                role: { 1: mockRole },
              },
              members: {
                members: { [mockMember.id]: mockMember },
              },
              member: {
                member: mockMember,
              },
            },
          }),
        ],
      },
    });
    const roleStore = useRoleStore();
    expect(roleStore.getRoles).toHaveLength(1);
    expect(wrapper.html()).toContain('Available Roles');
  });
});
