import { afterEach, describe, it, expect, beforeEach } from 'vitest';
import GuildsPlayingIndicatorCOmponent from '../../../components/guilds-playing-indicator.vue';
import { mount } from '@vue/test-utils';
import { mockGamePlay, mockGuild, mockQuest } from '../../utilities/StoreMocks';
import { createTestingPinia } from '@pinia/testing';

const initialMockGuild = JSON.parse(JSON.stringify(mockGuild));
const initialMockQuest = JSON.parse(JSON.stringify(mockQuest));
const initialMockGamePlay = JSON.parse(JSON.stringify(mockGamePlay));

function createWrapper(props = {}) {
  return mount(GuildsPlayingIndicatorCOmponent, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            guild: {
              currentGuild: mockGuild.id,
            },
            quest: {
              currentQuest: mockQuest.id,
              quests: { 1: mockQuest },
            },
          },
        }),
      ],
    },
    props: {
      guild: mockGuild,
      quest: mockQuest,
      playing: false,
      ...props,
    },
  });
}

describe('GuildsPlayingIndicatorCOmponent', () => {
  beforeEach(() => {
    mockGamePlay.game_status = 'confirmed';
    mockQuest.game_play.push(mockGamePlay);
  });
  afterEach(() => {
    Object.assign(mockGuild, JSON.parse(JSON.stringify(initialMockGuild)));
    Object.assign(mockQuest, JSON.parse(JSON.stringify(initialMockQuest)));
    Object.assign(
      mockGamePlay,
      JSON.parse(JSON.stringify(initialMockGamePlay)),
    );
  });
  it('Show Playing if member of guild is playing quest Test 1', () => {
    const wrapper = createWrapper({ playing: true });
    expect(wrapper.text()).toContain('Playing');
  });
  it('Show Play in Quest if member of guild and not playing Test 2', () => {
    mockGuild.is_member = true;
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('Play in this Quest');
  });
  it('Show Join this Guild (They are playing) if not member, quest is not playing, guild open for applications and game_status confirmed Test 3a', () => {
    mockGuild.open_for_applications = true;
    mockQuest.is_playing = false;
    const wrapper = createWrapper({ playing: false });
    expect(wrapper.text()).toContain('They are playing');
  });
  it('Show Join this Guild (They may play) if not a member, quest is not playing, guild open for applications and game play status not confirmed 3b', () => {
    mockGuild.open_for_applications = true;
    mockQuest.is_playing = false;
    mockQuest.game_play[0].game_status = 'interested';
    const wrapper = createWrapper({ playing: false });
    expect(wrapper.text()).toContain('They may play');
  });
  it('Show Opponent if quest is playing and game play status confirmed Test 4', () => {
    mockQuest.is_playing = true;
    mockQuest.game_play[0].game_status = 'confirmed';
    const wrapper = createWrapper({ playing: false });
    expect(wrapper.text()).toContain('Opponent');
  });
  it('Show Potential Opponent if quest is playing and game play status interested Test 5', () => {
    mockQuest.is_playing = true;
    mockQuest.game_play[0].game_status = 'interested';
    const wrapper = createWrapper({ playing: false });
    expect(wrapper.text()).toContain('Potential');
  });
});
