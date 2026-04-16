import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import RightDrawer from '../../../components/right-drawer.vue'; // Adjust the path to your component
import ChannelList from '../../../components/ChannelListComponent.vue'; // Import the actual ChannelList component
import { describe, it, expect, vi } from 'vitest';
import { Quasar } from 'quasar';
import {
  mockChannelsReadStatus,
  mockChannelStatusMap,
  mockChannel,
  mockGuildAfterJoin,
  mockMemberAfterJoin,
} from '../../utilities/StoreMocks';

// Mock getWSClient to return a mocked object with setDefaultGuild
vi.mock('src/wsclient', () => ({
  getWSClient: vi.fn(() => ({
    setDefaultGuild: vi.fn(),
  })),
}));

describe('RightDrawer', () => {
  it('passes props to ChannelList correctly', () => {
    const guild_id = mockGuildAfterJoin.id;
    const wrapper = mount(RightDrawer, {
      props: {
        currentGuild: mockGuildAfterJoin,
      },
      global: {
        plugins: [
          Quasar,
          createTestingPinia({
            initialState: {
              member: {
                member: mockMemberAfterJoin,
                isAuthenticated: true,
              },
              readStatus: {
                fullFetch: true,
                readStatus: mockChannelStatusMap,
                channelsReadStatus: mockChannelsReadStatus,
              },
              guild: {
                currentGuild: guild_id,
                guilds: {
                  1: mockGuildAfterJoin,
                },
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
                currentGuild: guild_id,
                currentChannel: 2,
              },
            },
          }),
        ],
      },
      $q: {
        dark: { isActive: false },
      },
    });

    // Find the ChannelList component instance

    const channelList = wrapper.findAllComponents(ChannelList).at(0);
    expect(channelList.exists()).toBe(true);

    // Assert that the props are passed correctly
    expect(channelList.props().guild_id).toBe(guild_id);
    expect(channelList.props().inPage).toBe(false);
    expect(channelList.props().title).toBe('Guild Channels');
  });
});
