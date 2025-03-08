import { ConversationNode, ReadStatusData } from '../types';
import { defineStore } from 'pinia';
import { useMemberStore } from './member';
import { useConversationStore } from './conversation';
import { useChannelStore } from './channel';
import { api } from '../boot/axios';
import { AxiosResponse } from 'axios';
import { useGuildStore } from './guilds';
import { useQuestStore } from './quests';

export interface ReadStatusMap {
  [key: number]: ReadStatusData;
}

interface ChannelsReadEntry {
  quest_id: number;
  read: number;
  unread: number;
}

export interface ChannelsReadMap {
  [key: number]: ChannelsReadEntry;
}

interface guildUnreadChannelRow {
  root_id: number;
  quest_id: number | null;
  read_status: boolean;
  count: number;
}

export interface ReadStatusState {
  fullFetch: false;
  readStatus?: ReadStatusMap;
  channelsReadStatus: ChannelsReadMap;
}
const baseState: ReadStatusState = {
  fullFetch: false,
  readStatus: {},
  channelsReadStatus: undefined,
};
const clearBaseState: ReadStatusState = {
  fullFetch: false,
  readStatus: {},
  channelsReadStatus: undefined,
};

export const useReadStatusStore = defineStore('readStatus', {
  state: () => baseState,
  getters: {
    hasUnreadChannels: (state: ReadStatusState) => {
      if (!state.channelsReadStatus) return false;
      return Object.values(state.channelsReadStatus).some(
        (entry) => entry.unread > 0,
      );
    },

    getNodeReadStatus:
      (state: ReadStatusState) =>
      (node_id: number): boolean => {
        const memberStore = useMemberStore();
        const memberId = memberStore.getUserId;
        if (state.readStatus) {
          const read: ReadStatusData[] = Object.values(state.readStatus).filter(
            (isRead: ReadStatusData) => isRead.node_id == node_id && memberId,
          );
          if (read.length > 0) {
            return state.readStatus[node_id].status;
          } else return true;
        }
      },
    getNodeSize:
      (state: ReadStatusState) =>
      (node_id: number): number | undefined => {
        if (state.readStatus) {
          return state.readStatus[node_id]?.node_count;
        }
      },
    getUnreadStatusCount: (state: ReadStatusState) => (node_id: number) => {
      if (state.readStatus && state.readStatus[node_id]) {
        const unreadStatusCount: number =
          state.readStatus[node_id].node_count -
          state.readStatus[node_id].read_count;
        return unreadStatusCount;
      }
      return 0;
    },

    getNodeStatusCount: (state: ReadStatusState) => (node_id: number) => {
      if (state.readStatus) {
        return state.readStatus[node_id].node_count;
      }
    },
  },
  actions: {
    async ensureReadStatusByGuild() {
      const channelStore = useChannelStore();
      const channels = channelStore.getChannels;
      const readStatus = await this.fetchAllReadStatus();
      const guildReadStaus = readStatus.filter((c) =>
        channels.some((r) => c.node_id == r.id),
      );
      this.readStatus = guildReadStaus;
    },
    async ensureAllQuestsReadStatus() {
      const conversationStore = useConversationStore();
      if (conversationStore.conversationRoot) {
        const cn: ConversationNode = conversationStore.conversationRoot;

        const rootid: number = cn.id;
        await this.fetchReadStatus({ rootid });
      }
    },
    async ensureGuildUnreadChannels() {
      try {
        const memberStore = useMemberStore();
        const guildStore = useGuildStore();
        const questStore = useQuestStore();

        const member_id = memberStore.getUserId;
        const guild_id = guildStore.getCurrentGuild.id;
        const quest_id = questStore.getCurrentQuest?.id ?? null;

        if (!member_id || !guild_id) {
          console.warn(
            'Missing member_id or guild_id. Cannot fetch unread channels.',
          );
          return;
        }

        const unreadChannels: guildUnreadChannelRow[] =
          await this.fetchGuildUnreadChannels({
            member_id,
            guild_id,
            quest_id,
          });

        if (unreadChannels) {
          const root_map: ChannelsReadMap = {};
          for (const x of unreadChannels) {
            if (root_map[x.root_id] == undefined)
              root_map[x.root_id] = {
                quest_id: x.quest_id,
                read: 0,
                unread: 0,
              };
            if (x.read_status) root_map[x.root_id].read = x.count;
            else root_map[x.root_id].unread = x.count;
          }
          this.channelsReadStatus = root_map;
          console.log('Unread channels successfully updated.');
        } else {
          console.warn('No unread channels were returned.');
        }
      } catch (error) {
        console.error('Error ensuring guild unread channels:', error);
      }
    },

    async ensureReadStatusOfGuild() {
      const channelStore = useChannelStore();
      if (channelStore.getCurrentGuild) {
        await this.fetchReadStatus();
      }
    },
    async ensureAllChannelReadStatus() {
      const channelStore = useChannelStore();
      if (channelStore.getCurrentChannel) {
        const rootid = channelStore.getCurrentChannel;
        await this.fetchReadStatus({ rootid });
      }
    },
    resetReadStatus() {
      Object.assign(this, clearBaseState);
    },
    // Axios Calls
    async createReadStatus(data: Partial<ReadStatusData>) {
      const res: AxiosResponse<ReadStatusData[]> = await api.post(
        '/read_status',
        {
          data,
        },
      );
      if (res.status == 201) {
        const readStatusData: ReadStatusData = Object.assign(res.data[0], {
          node_id: null,
        });
        this.readStatus = {
          ...this.readStatus,
          [readStatusData.node_id]: readStatusData,
        };
      }
    },
    async updateReadStatus(data: Partial<ReadStatusData>) {
      const res: AxiosResponse<ReadStatusData[]> = await api.patch(
        `/read_status/${data.node_id}`,
        data,
      );
      if (res.status == 200) {
        const readStatus = res.data[0];
        if (this.readStatus) {
          const readStatusData: ReadStatusData = Object.assign(
            this.readStatus[readStatus.node_id],
            readStatus,
          );
          this.readStatus = {
            ...this.readStatus,
            [readStatus.node_id]: readStatusData,
          };
        }
      }
    },
    async fetchReadStatus(params: { rootid: number }) {
      const res: AxiosResponse<ReadStatusData[]> = await api.post(
        'rpc/unread_status_list',
        params,
      );
      if (res.status == 200) {
        this['readStatus'] = Object.fromEntries(
          res.data.map((x) => [x.node_id, x]),
        );
        if (
          this.channelsReadStatus !== undefined &&
          !!this.channelsReadStatus[params.rootid]
        ) {
          const channelData: ChannelsReadEntry =
            this.channelsReadStatus[params.rootid];
          channelData.read = this.readStatus[params.rootid].read_count;
          channelData.unread =
            this.readStatus[params.rootid].node_count - channelData.read;
          this.channelsReadStatus = {
            ...this.channelsReadStatus,
            [params.rootid]: channelData,
          };
        }
      }
    },
    async fetchGuildUnreadChannels(params: {
      member_id: number;
      guild_id: number;
      quest_id: number;
    }): Promise<guildUnreadChannelRow[]> {
      try {
        const res: AxiosResponse<guildUnreadChannelRow[]> = await api.post(
          'rpc/guild_unread_channels',
          params,
        );
        if (res.status === 200) {
          return res.data;
        } else {
          console.error(
            'Failed to fetch guild unread channels. Server responded with:',
            res.status,
          );
          return [];
        }
      } catch (error) {
        console.error('Error fetching guild unread channels:', error);
        return [];
      }
    },

    async fetchAllReadStatus() {
      const res: AxiosResponse<ReadStatusData[]> =
        await api.get('/read_status');
      if (res.status == 200) {
        return res.data;
      }
    },

    async CreateOrUpdateReadStatus(data: {
      nodeid: number;
      new_status: boolean;
      override: boolean;
    }) {
      const channelStore = useChannelStore();
      const res: AxiosResponse<{
        new_node_id: number;
        new_member_id: number;
        status_new: boolean;
      }> = await api.post('rpc/node_set_read_status', data);
      if (res.status == 200 || res.status == 201) {
        const memberStore = useMemberStore();
        const memberId = memberStore.getUserId;
        const node_id = res.data.new_node_id;
        if (this.readStatus) {
          const read = Object.values(this.readStatus).filter(
            (isRead: ReadStatusData) => isRead.node_id == node_id && memberId,
          );

          if (read.length > 0 && this.readStatus) {
            this.readStatus[node_id].status = res.data.status_new;
          } else {
            this.readStatus = {
              ...this.readStatus,
              [node_id]: {
                node_id,
                member_id: res.data.new_member_id,
                seconds_shown: 0,
                status: res.data.status_new,
                node_count: 0,
                read_count: 0,
              },
            };
          }
          const rootId = channelStore.getChannelOfNode(data.nodeid);
          if (
            this.channelsReadStatus !== undefined &&
            !!this.channelsReadStatus[rootId]
          ) {
            const channelData: ChannelsReadEntry =
              this.channelsReadStatus[rootId];
            if (res.data.status_new) {
              channelData.read += 1;
              channelData.unread -= 1;
            } else {
              channelData.read -= 1;
              channelData.read += 1;
            }
            this.channelsReadStatus = {
              ...this.channelsReadStatus,
              [rootId]: channelData,
            };
          }
        }
      }
    },
  },
});
