import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { describe, expect, it } from 'vitest';
import nodeTreeComponent from 'src/components/node-tree.vue';
import { mockGuild, mockMember, mockNode, mockQuest } from '../../utilities/StoreMocks';
import { flushPromises, mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

installQuasarPlugin();
function createWrapper(props = {}) {
  return mount(nodeTreeComponent, {
    props: {
      currentQuestId: mockQuest.id,
      currentGuildId: mockGuild.id,
      channelId: undefined,
      isChannel: false,
      editable: false,
      hideDescription: false,
      initialSelectionNodeId: mockNode.id,
      ready: true,
      ...props,
    },
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            quest: {
              currentQuest: mockQuest.id,
              quests: { 1: mockQuest },
            },
            conversation: {
              conversationRoot: mockNode,
              conversation: { 1: mockNode },
              full: true,
            },
            members: {
              members: { 1: mockMember },
            },
          },
        }),
      ],
    },
  });
}

describe('NodeTree component', () => {
  it('show search filter menu', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    await nextTick();
    const icon = wrapper.find('.q-icon.material-icons');
    // Check if the icon is displayed
    expect(icon.exists()).toBe(true);
    expect(icon.text()).toBe('menu');
  });
  (it('Display QTree'),
    async () => {
      const wrapper = createWrapper();
      await flushPromises();
      await nextTick();
      const tree = wrapper.find('.q-tree');
      expect(tree.exists()).toBe(true);
    });
});
