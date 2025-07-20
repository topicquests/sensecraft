import { defineStore } from 'pinia';
import type { AxiosResponse } from 'axios';
import { api } from '../boot/axios';
import {
  ConversationNode,
  conversationNodePatchKeys,
  QTreeNode,
} from '../types';
import { publication_state_enum, permission_enum } from '../enums';
import { makeTree, ConversationMap } from './conversation';
import { useMemberStore } from './member';
import { useQuestStore } from './quests';
import { useBaseStore, filterKeys } from './baseStore';
import { useGuildStore } from './guilds';

interface ChannelMap {
  [key: number]: ConversationMap;
}

export interface ChannelState {
  channels: ConversationMap;
  channelData: ChannelMap;
  currentGuild?: number;
  currentChannel?: number;
}

const baseState: ChannelState = {
  currentGuild: undefined,
  channels: {},
  channelData: {},
  currentChannel: undefined,
};
const clearBaseState: ChannelState = {
  currentGuild: undefined,
  channels: {},
  channelData: {},
  currentChannel: undefined,
};

export const useChannelStore = defineStore('channel', {
  state: () => baseState,

  getters: {
    getChannels: (state: ChannelState): ConversationNode[] =>
      Object.values(state.channels),
    getGuildChannels: (state: ChannelState): ConversationNode[] =>
      Object.values(state.channels).filter(
        (c: ConversationNode) => c.quest_id == undefined,
      ),
    getCurrentGuild: (state: ChannelState) => state.currentGuild,
    getChannelsCurrentGuildId: (state: ChannelState) => state.currentGuild,

    getRootGuildChannels: (state: ChannelState): ConversationNode[] =>
      Object.values(state.channels).filter(
        (c: ConversationNode) =>
          c.guild_id == state.currentGuild &&
          c.parent_id == null &&
          c.quest_id == undefined,
      ),
    getGameChannels: (state: ChannelState): ConversationNode[] =>
      Object.values(state.channels).filter(
        (c: ConversationNode) => c.quest_id != undefined,
      ),
    getGameChannelsOfQuest:
      (state: ChannelState) =>
      (quest_id: number): ConversationNode[] =>
        Object.values(state.channels).filter(
          (c: ConversationNode) => c.quest_id == quest_id,
        ),
    getChannelById: (state: ChannelState) => (id: number) =>
      state.channelData[id],
    getChannelConversation: (state: ChannelState) => (channel_id: number) =>
      state.channelData[channel_id],
    getChannelConversationTree:
      (state: ChannelState) =>
      (channel_id: number): QTreeNode[] => {
        const channel = state.channelData[channel_id];
        if (channel) return makeTree(Object.values(channel));
        return [];
      },
    getChannelChildrenOf: (state: ChannelState) => (node_id: number) => {
      if (state.currentChannel) {
        return Object.values(state.channelData[state.currentChannel]).filter(
          (n) => n.parent_id == node_id,
        );
      }
    },
    getChannelsByGuildId: (state: ChannelState) => {
      if (state.currentGuild) {
        return Object.values(state.channels).filter(
          (n) => n.guild_id == state.currentGuild,
        );
      }
    },
    getCurrentChannel: (state: ChannelState) => state.currentChannel,
    getChannelNode:
      (state: ChannelState) => (channel_id: number, node_id: number) =>
        state.channelData[channel_id]?.[node_id],
      getChannelOfNode: (state: ChannelState) => (node_id: number): string | undefined => {
        for (const channel_id of Object.keys(state.channelData)) {
          const channel = state.channelData[Number (channel_id)];
          if (channel && channel[node_id]) {
            return channel_id;
          }
        }
        return undefined;
      },


    canEdit:
      (state: ChannelState) => (channel_id?: number, node_id?: number) => {
        const memberStore = useMemberStore();
        const questStore = useQuestStore();
        const guildStore = useGuildStore();
        const baseStore = useBaseStore();
        if (memberStore && memberStore.getUserId) {
          const userId = memberStore.getUserId;
          if (typeof channel_id === 'number' && typeof node_id === 'number') {
            const node = state.channelData[channel_id]?.[node_id];
            if (node && node.guild_id && userId) {
              if (node.status == publication_state_enum.private_draft) {
                return node.creator_id == userId;
                // TODO: role_draft
              } else if (node.status == publication_state_enum.guild_draft) {
                if (node.quest_id) {
                  const casting = questStore.castingInQuest(
                    node.quest_id,
                    userId,
                  );
                  return casting?.guild_id == node.guild_id;
                }
                return guildStore.isGuildMember(node.guild_id);
              }
            } else if (node.status == publication_state_enum.proposed) {
              return baseStore.hasPermission(
                permission_enum.guildAdmin,
                node.guild_id,
                node.guild_id,
              );
            }
          }
        }
        return false;
      },
  },

  actions: {
    setCurrentChannel(channel_id: number) {
      this.currentChannel = channel_id;
    },
    setCurrentGuild(guild_id: number) {
      this.currentGuild = guild_id;
    },
    async ensureChannels(guild_id: number) {
      if (guild_id != this.currentGuild) {
        await this.fetchChannels(guild_id);
      }
    },
    async ensureChannelConversation(channel_id: number, guild?: number) {
      const guildStore = useGuildStore();
      if (
        guild != guildStore.currentGuild ||
        this.channelData[channel_id] === undefined
      ) {
        await this.fetchChannelConversation(channel_id);
      }
    },
    async ensureAllChannels() {
      await this.fetchAllChannels();
    },
    resetChannel() {
      Object.assign(this, clearBaseState);
    },
    addToState(node: Partial<ConversationNode>) {
      if(node.ancestry) {
        const channel_id = Number.parseInt(node.ancestry.split('.')[0]);
        if (!node.parent_id) {
          this.channels = { ...this.channels, [channel_id]: node as QTreeNode };
        }
        if (node.parent_id && !this.channelData[channel_id]) {
          console.error('Missing channel');
          this.channelData[channel_id] = {};
        }
       if (!this.channelData[channel_id]) {
        this.channelData[channel_id] = {};
      }

      if (node.id !== undefined) {
        this.channelData[channel_id][node.id] = node as QTreeNode;
      }
        this.currentChannel = channel_id;
      }
    },

    async fetchChannels(guild_id: number) {
      const params = {
        guild_id: `eq.${guild_id}`,
        meta: 'eq.channel',
        parent_id: 'is.null',
      };
      const res: AxiosResponse<ConversationNode[]> = await api.get(
        '/conversation_node',
        { params },
      );
      if (res.status == 200) {
        const guildStore = useGuildStore();
        if (res.data.length > 0) {
          if (
            res.data[0].guild_id &&
            guildStore.currentGuild !== res.data[0].guild_id
          ) {
            guildStore.currentGuild = res.data[0].guild_id;
            this.channelData = {};
          }
          this.channels = Object.fromEntries(
            res.data.map((node: ConversationNode) => [node.id, node]),
          );
        }
      }
    },
    async fetchAllChannels() {
      const params = {
        meta: 'eq.channel',
      };
      const res: AxiosResponse<ConversationNode[]> = await api.get(
        '/conversation_node',
        { params },
      );
      if (res.status == 200) {
        if (res.data.length > 0) {
          this.channels = Object.fromEntries(
            res.data.map((node: ConversationNode) => [node.id, node]),
          );
        }
      }
    },

    async fetchChannelConversation(
      node_id: number,
    ): Promise<ConversationNode[]> {
      const params = Object();
      params.node_id = node_id;
      const res: AxiosResponse<ConversationNode[]> = await api.get(
        'rpc/node_subtree',
        {
          params,
        },
      );
      if (res.status == 200) {
        const channel_id = params.node_id;
        const firstNode = res.data[0];
        if (this.currentGuild !== firstNode.guild_id) {
          this.currentGuild = firstNode.guild_id;
          this.channels = {};
        }
        const nodes: Record<number, ConversationNode> = Object.fromEntries(
          res.data.map((node: Partial<ConversationNode>) => [node.id, node]),
        );
        const channel = nodes[channel_id];
        if (channel.meta != 'channel' || channel.parent_id != null)
          throw Error('not a channel');
        this.channelData = { ...this.channelData, [channel_id]: nodes };
        this.currentChannel = channel_id;
        return res.data;
      }
      return [];
    },
    async createChannelNode(node: Partial<ConversationNode>) {
      const res: AxiosResponse<ConversationNode[]> = await api.post(
        '/conversation_node',
        node,
      );
      if (res.status == 201) {
        const node = res.data[0];
        this.addToState(node);
      }
    },
    async updateChannelNode(data: Partial<ConversationNode>) {
      const params = Object();
      params.id = data.id;
      data = filterKeys(data, conversationNodePatchKeys);
      const res: AxiosResponse<ConversationNode[]> = await api.patch(
        `/conversation_node?id=eq.${params.id}`,
        data,
      );
      if (res.status == 200) {
        const node = res.data[0];
        this.addToState(node);
      }
    },
  },
});
