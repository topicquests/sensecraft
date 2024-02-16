import { defineStore } from 'pinia';
import {filterKeys} from "./base";
import type { AxiosResponse } from "axios";
import { api } from '../boot/axios';
import { ConversationNode, conversationNodePatchKeys, QTreeNode } from "../types";
import { publication_state_enum, permission_enum } from "../enums";
import { makeTree, ConversationMap } from "./conversation";
import { useMemberStore } from './member'
import { useQuestStore } from './quests'
import { useBaseStore } from './baseStore'

interface ChannelMap {
  [key: number]: ConversationMap;
}

export interface ChannelState {
  channels: ConversationMap;
  channelData: ChannelMap;
  currentGuild: number;
  currentChannel: number;
}

const baseState: ChannelState = {
  currentGuild: null,
  channels: {},
  channelData: {},
  currentChannel: null,
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
    getGameChannels: (state: ChannelState): ConversationNode[] =>
      Object.values(state.channels).filter(
      (c: ConversationNode) => c.quest_id != undefined,
    ),
    getGameChannelsOfQuest: (state: ChannelState): ConversationNode[] =>
      (quest_id: number): ConversationNode[] =>
      Object.values(state.channels).filter(
        (c: ConversationNode) => c.quest_id == quest_id,
      ),
    getChannelById: (state: ChannelState): ConversationNode[] => (id: number) =>
      state.channelData[id],
    getChannelConversation: (state: ChannelState): ConversationNode[] => (channel_id: number) =>
      state.channelData[channel_id],
    getChannelConversationTree: (state: ChannelState): QTreeNode[] => (channel_id: number) => {
      const channel = state.channelData[channel_id];
      if (channel) return makeTree(Object.values(channel));
        return [];
    },
    getChannelChildrenOf: (state: ChannelState):ConversationNode[] => (node_id: number) => {
      return Object.values(state.channelData[state.currentChannel]).filter(
      (n) => n.parent_id == node_id,
      );
    },
    getCurrentChannel: (state: ChannelState): number => state.currentChannel,
    getChannelNode: (state: ChannelState): ChannelMap => (channel_id: number, node_id: number) =>
      state.channelData[channel_id]?.[node_id],
    canEdit: (state: ChannelState) => (channel_id: number, node_id: number) => {
      const memberStore = useMemberStore();
      const questStore = useQuestStore();
      const baseStore = useBaseStore();
      const userId = memberStore.getUserId();
      const node = state.channelData[channel_id]?.[node_id];
      if (node && userId) {
        if (node.status == publication_state_enum.private_draft) {
          return node.creator_id == userId;
        // TODO: role_draft
       } else if (node.status == publication_state_enum.guild_draft) {
        const casting = questStore.castingInQuest()(
          node.guild_id,
        );
        return casting?.guild_id == node.guild_id;
      } else if (node.status == publication_state_enum.proposed) {
        return baseStore.hasPermission()(
          permission_enum.guildAdmin,
          node.guild_id,
          node.guild_id,
        );
      }
    }
      return false;
    }
  },

actions: {
  setCurrentChannel (channel_id: number) {
    this.currentChannel = channel_id;
  },
  async ensureChannels(guild_id: number) {
    if (guild_id != this.currentGuild) {
      await this.fetchChannels (guild_id);
    }
  },
  ensureChannelConversation: async (
    { channel_id, guild }: { channel_id: number; guild: number }) => {
    if (
      guild != context.state.currentGuild ||
      context.state.channelData[channel_id] === undefined
    ) {
      await fetchChannelConversation({params: { node_id: channel_id }})
    }
  },
  resetChannel: (state: ChannelState) => {
    Object.assign(state, baseState);
  },
  addToState(state: ChannelState, node: ConversationNode) {
    const channel_id = Number.parseInt(node.ancestry.split(".")[0]);
    if (!node.parent_id) {
      this.channels = { ...state.channels, [channel_id]: node };
    }
    if (node.parent_id && state.channelData[channel_id] == undefined) {
      console.log("Missing channel");
      return;
    }
    const channelData = { ...this.channelData[channel_id], [node.id]: node };
    this.channelData = {
      ...this.channelData,
      [channel_id]: channelData,
    };
    this.currentChannel = channel_id;
  },
  async fetchChannels(guild_id: number, ) {
    const params = {
      guild_id: `eq.${guild_id}`
    };
    const res:AxiosResponse<ConversationNode> = await api.get('/conversation_node', {params})
    if(res.status == 200) {
      if (this.currentGuild !== params.guild_id) {
        this.currentGuild = params.guild_id;
        this.channelData = {};
      }
      this.channels = Object.fromEntries(
        res.data.map((node: ConversationNode) => [node.id, node]),
      );
    }
  },
  
    async fetchChannelConversation(params){
      const res:AxiosResponse<ConversationNode[]> = api.get('rpc/node_subtree', params)
      if (res == 200) {
        const channel_id = params.node_id;
        const firstNode = res.data[0];
        if (this.currentGuild !== firstNode.guild_id) {
          this.currentGuild = firstNode.guild_id;
          this.channels = {};
        }
        const nodes: ConversationMap = Object.fromEntries(
          res.data.map((node: ConversationNode) => [node.id, node]),
        );
        const channel = nodes[channel_id];
        if (channel.meta != "channel" || channel.parent_id != null)
          throw Error("not a channel");
        this.channelData = { ...this.channelData, [channel_id]: nodes };
        this.currentChannel = channel_id;
      }
    }
  }
})


/*
    .get({
      path: ({ guild_id }: { guild_id: number }) =>
        `/conversation_node?guild_id=eq.${guild_id}&meta=eq.channel&parent_id=is.null`,
      property: "channels",
      action: "fetchChannels",
      onSuccess: (
        state: ChannelState,
        res: AxiosResponse<ConversationNode[]>,
        axios: AxiosInstance,
        { params, data },
      ) => {
        if (state.currentGuild !== params.guild_id) {
          state.currentGuild = params.guild_id;
          state.channelData = {};
        }
        state.channels = Object.fromEntries(
          res.data.map((node: ConversationNode) => [node.id, node]),
        );
      },
    })

    .post({
      action: "createChannelNode",
      path: "/conversation_node",
      onSuccess: (
        state: ChannelState,
        res: AxiosResponse<ConversationNode[]>,
        axios: AxiosInstance,
        { params, data },
      ) => {
        const node = res.data[0];
        addToState(state, node);
      },
    })
    .patch({
      action: "updateChannelNode",
      path: ({ id }: { id: number }) => `/conversation_node?id=eq.${id}`,
      beforeRequest: (state, actionParams) => {
        const { params, data } = actionParams;
        params.id = data.id;
        actionParams.data = filterKeys(data, conversationNodePatchKeys);
      },
      onSuccess: (
        state: ChannelState,
        res: AxiosResponse<ConversationNode[]>,
        axios: AxiosInstance,
        { data },
      ) => {
        const node = res.data[0];
        addToState(state, node);
      },
    })
    // Step 4
    .getVuexStore({
      getters: ChannelGetters,
      actions: ChannelActions,
      mutations: {
        SET_CURRENT_CHANNEL: (state: ChannelState, channel_id: number) => {
          state.currentChannel = channel_id;
        },
        CLEAR_STATE: (state: ChannelState) => {
          Object.assign(state, baseState);
        },
        ADD_TO_STATE: (state: ChannelState, node: ConversationNode) => {
          addToState(state, node);
        },
      },
    });



export type ChannelActionTypes = RetypeActionTypes<typeof ChannelActions> &
  ChannelRestActionTypes;
export type ChannelGetterTypes = RetypeGetterTypes<typeof ChannelGetters>;
*/