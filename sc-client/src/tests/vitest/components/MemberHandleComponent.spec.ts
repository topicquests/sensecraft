import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { describe, expect, it } from 'vitest';
import memberHandleComponent from 'src/components/member-handle.vue';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mockMember } from '../../utilities/StoreMocks';

installQuasarPlugin();

describe('MemberHandleComponent', () => {
  it('show member handle if user', async () => {
    const wrapper = mount(memberHandleComponent, {
      props: {
        ready: true,
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              member: {
                member: mockMember,
              },
            },
          }),
        ],
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('JohnSmith');
  });
});
