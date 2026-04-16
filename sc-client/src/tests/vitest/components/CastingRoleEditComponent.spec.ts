import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import CastingRoleEdit from '../../../components/casting_role_edit.vue';
import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';

installQuasarPlugin();
describe('CastingRoleEdit.vue', () => {
  it('renders correctly with props', () => {
    const wrapper = mount(CastingRoleEdit, {
      props: {
        availableRoles: [
          { id: 1, name: 'Role 1' },
          { id: 2, name: 'Role 2' },
        ],
        castingRoles: [{ id: 1, name: 'Role 1' }],
        questId: 1,
        guildId: 1,
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              member: {
                member: {
                  handle: 'TestUser',
                },
              },
              quest: {
                currentQuest: {
                  name: 'Quest 1',
                },
              },
            },
          }),
        ],
      },
    });
    expect(wrapper.text()).toContain('Change casting role');
    expect(wrapper.text()).toContain('Role 1');
    expect(wrapper.find('.handle').text()).toBe('TestUser');
  });

  it('emits events when casting roles are added or removed', async () => {
    const castingRoleAdd = vi.fn();
    const castingRoleRemove = vi.fn();
    const wrapper = mount(CastingRoleEdit, {
      props: {
        availableRoles: [
          { id: 1, name: 'Role 1' },
          { id: 2, name: 'Role 2' },
        ],
        castingRoles: [{ id: 1, name: 'Role 1' }],
        questId: 1,
        guildId: 1,
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              member: { member: { handle: 'TestUser' } },
              quest: { currentQuest: { name: 'Quest 1' } },
            },
          }),
        ],
      },
      attrs: {
        onCastingRoleAdd: castingRoleAdd,
        onCastingRoleRemove: castingRoleRemove,
      },
    });
    const select = wrapper.findComponent({ name: 'QSelect' });
    // Simulate adding a role
    await select.vm.$emit('add', { value: 2 });
    expect(castingRoleAdd).toHaveBeenCalledWith(2);
    // Simulate removing a role
    await select.vm.$emit('remove', { value: { id: 1, name: 'Role 1' } });
    expect(castingRoleRemove).toHaveBeenCalledWith(1);
  });
});
