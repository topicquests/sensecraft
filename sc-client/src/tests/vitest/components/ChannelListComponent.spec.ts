import { mount } from '@vue/test-utils';
import ChannelListComponent from '../../../components/ChannelListComponent.vue';
import { createTestingPinia } from '@pinia/testing';
import { describe, it, expect, vi } from 'vitest';
import { nextTick } from 'vue';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import {
  mockChannelsReadStatus,
  mockChannelStatusMap,
  mockChannel,
} from '../../utilities/StoreMocks';

installQuasarPlugin();

// Mock getWSClient to return a mocked object with setDefaultGuild
vi.mock('src/wsclient', () => ({
  getWSClient: vi.fn(() => ({
    setDefaultGuild: vi.fn(),
  })),
}));

function createWrapper(props = {}) {
  return mount(ChannelListComponent, {
    props: {
      inPage: false,
      title: 'Test',
      guild_id: 1,
      quest_id: 123,
      ready: true,
      ...props,
    },
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            readStatus: {
              fullFetch: true,
              readStatus: mockChannelStatusMap,
              channelsReadStatus: mockChannelsReadStatus,
            },
            guild: {
              currentGuild: 1,
            },
            channels: {
              channels: {
                2: mockChannel,
              },
              channelData: {
                2: {
                  2: mockChannel,
                },
              },
              currentGuild: 1,
              currentChannel: 2,
            },
          },
        }),
      ],
    },
  });
}

describe('ChannelListComponent', () => {
  it('q-card not rendered if ready is false', async () => {
    const wrapper = createWrapper();
    wrapper.vm.ready = false;
    await nextTick();
    const qCard = wrapper.findComponent({ name: 'QCard' });
    expect(qCard.exists()).toBe(false);
  });

  it('q-card rendered when inPage is false and quest_id', async () => {
    const wrapper = createWrapper();
    wrapper.vm.ready = true;
    await wrapper.vm.$nextTick();
    const qCard = wrapper.findComponent({ name: 'QCard' });
    expect(qCard.exists()).toBe(true);
    const routerLink = wrapper.findComponent({ name: 'RouterLink' });
    expect(routerLink.props('to')).toEqual({
      name: 'game_channel_list',
      params: { guild_id: '1', quest_id: '123' },
    });
    expect(routerLink.attributes('href')).toBe('/guild/1/quest/123/channel');
  });

  it('q-card rendered when inPage is false no quest_id', async () => {
    const wrapper = createWrapper({ quest_id: undefined });
    wrapper.vm.ready = true;
    await wrapper.vm.$nextTick();
    const qCard = wrapper.findComponent({ name: 'QCard' });
    expect(qCard.exists()).toBe(true);
    const routerLink = wrapper.findComponent({ name: 'RouterLink' });
    expect(routerLink.props('to')).toEqual({
      name: 'guild_channel_list',
      params: { guild_id: '1' },
    });
    expect(routerLink.attributes('href')).toBe('/guild/1/channel');
  });

  it('renders a <p> tag with the title when inPage is true', async () => {
    const wrapper = createWrapper({ inPage: true });
    wrapper.vm.ready = true;
    await wrapper.vm.$nextTick();
    const pTag = wrapper.find('p');
    expect(pTag.exists()).toBe(true);
    expect(pTag.text()).toBe('Test');
  });
});
