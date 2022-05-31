import {
  MyVapi,
  RestParamActionType,
  RestDataActionType,
  RetypeActionTypes,
  RetypeGetterTypes,
} from "./base";
import type { AxiosResponse, AxiosInstance } from "axios";
import { ConversationNode } from "../types";
import {
  publication_state_enum,
  permission_enum,
} from "../enums";
import { makeTree, ConversationMap } from "./conversation";

interface ChannelMap {
  [key: number]: ConversationMap;
}

export interface ChannelState extends Object {
  channels: ConversationMap;
  channelData: ChannelMap;
  currentGuild: number;
}

function addToState(state: ChannelState, node: ConversationNode) {
  const channel_id = Number.parseInt(node.ancestry.split(".")[0]);
  if (!node.parent_id) {
    state.channels = {...state.channels, [channel_id]: node};
  }
  if (node.parent_id && state.channelData[channel_id] == undefined) {
    console.log("Missing channel");
    return;
  }
  const channelData = { ...state.channelData[channel_id], [node.id]: node };
  state.channelData = {   
    ...state.channelData,
    [channel_id]: channelData,
  };
}

const ChannelGetters = {
  getChannels: (state: ChannelState): ConversationNode[] =>
    Object.values(state.channels),
  getGuildChannels: (state: ChannelState): ConversationNode[] =>
    Object.values(state.channels).filter(
      (c: ConversationNode) => c.quest_id == undefined
    ),
  getGameChannels: (state: ChannelState): ConversationNode[] =>
    Object.values(state.channels).filter(
      (c: ConversationNode) => c.quest_id != undefined
    ),
  getGameChannelsOfQuest:
    (state: ChannelState) =>
    (quest_id: number): ConversationNode[] =>
      Object.values(state.channels).filter(
        (c: ConversationNode) => c.quest_id == quest_id
      ),
  getChannelById: (state: ChannelState) => (id: number) => state.channels[id],
  getChannelConversation: (state: ChannelState) => (channel_id: number) =>
    state.channelData[channel_id],
  getChannelConversationTree: (state: ChannelState) => (channel_id: number) => {
    const channel = state.channelData[channel_id];
    if (channel) return makeTree(Object.values(channel));
    return [];
  },
  getChannelNode:
    (state: ChannelState) => (channel_id: number, node_id: number) =>
      state.channelData[channel_id]?.[node_id],
  canEdit: (state: ChannelState) => (channel_id: number, node_id: number) => {
    const userId = MyVapi.store.getters["member/getUserId"];
    const node = state.channelData[channel_id]?.[node_id];
    if (node && userId) {
      if (node.status == publication_state_enum.private_draft) {
        return node.creator_id == userId;
        // TODO: role_draft
      } else if (node.status == publication_state_enum.guild_draft) {
        const casting = MyVapi.store.getters["quests/castingInQuest"](
          node.guild_id
        );
        return casting?.guild_id == node.guild_id;
      } else if (node.status == publication_state_enum.proposed) {
        return MyVapi.store.getters["hasPermission"](
          permission_enum.guildAdmin,
          node.guild_id,
          node.guild_id
        );
      }
    }
    return false;
  },
};

const ChannelActions = {
  reset: (context) => {
    context.commit("CLEAR_STATE");
  },
  ensureChannels: async (context, guild_id: number) => {
    if (guild_id != context.state.currentGuild) {
      await context.dispatch("fetchChannels", { params: { guild_id } });
    }
  },
  ensureChannelConversation: async (
    context,
    { channel_id, guild }: { channel_id: number; guild: number }
  ) => {
    if (
      guild != context.state.currentGuild ||
      context.state.channelData[channel_id] === undefined
    ) {
      await context.dispatch("fetchChannelConversation", {
        params: { node_id: channel_id },
      });
    }
  },
  resetChannel: (context) => {
    context.commit("CLEAR_STATE");
  },
};

const baseState: ChannelState = {
  currentGuild: null,
  channels: {},
  channelData: {},
};

export const channel = (axios: AxiosInstance) =>
  new MyVapi<ChannelState>({
    axios,
    state: baseState,
  })
    // Step 3
    .get({
      path: ({ guild_id }: { guild_id: number }) =>
        `/conversation_node?guild_id=eq.${guild_id}&meta=eq.channel&parent_id=is.null`,
      property: "channels",
      action: "fetchChannels",
      onSuccess: (
        state: ChannelState,
        res: AxiosResponse<ConversationNode[]>,
        axios: AxiosInstance,
        { params, data }
      ) => {
        if (state.currentGuild !== params.guild_id) {
          state.currentGuild = params.guild_id;
          state.channelData = {};
        }
        state.channels = Object.fromEntries(
          res.data.map((node: ConversationNode) => [node.id, node])
        );
      },
    })
    .call({
      path: "node_subtree",
      property: "conversation",
      action: "fetchChannelConversation",
      readOnly: true,
      onSuccess: (
        state: ChannelState,
        res: AxiosResponse<ConversationNode[]>,
        axios: AxiosInstance,
        { params, data }
      ) => {
        const channel_id = params.node_id;
        const firstNode = res.data[0];
        if (state.currentGuild !== firstNode.guild_id) {
          state.currentGuild = firstNode.guild_id;
          state.channels = {};
        }
        const nodes: ConversationMap = Object.fromEntries(
          res.data.map((node: ConversationNode) => [node.id, node])
        );
        const channel = nodes[channel_id];
        if (channel.meta != "channel" || channel.parent_id != null)
          throw Error("not a channel");
        state.channelData = { ...state.channelData, [channel_id]: nodes };
      },
    })
    .post({
      action: "createChannelNode",
      path: "/conversation_node",
      onSuccess: (
        state: ChannelState,
        res: AxiosResponse<ConversationNode[]>,
        axios: AxiosInstance,
        { params, data }
      ) => {
        const node = res.data[0];
        addToState(state, node);
      },
    })
    .patch({
      action: "updateChannelNode",
      path: ({ id }: { id: number }) => `/conversation_node?id=eq.${id}`,
      beforeRequest: (state, { params, data }) => {
        params.id = data.id;
        data.updated_at = undefined;
      },
      onSuccess: (
        state: ChannelState,
        res: AxiosResponse<ConversationNode[]>,
        axios: AxiosInstance,
        { data }
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
        CLEAR_STATE: (state: ChannelState) => {
          Object.assign(state, baseState);
        },
        ADD_TO_STATE: (state: ChannelState, node: ConversationNode) => {
          addToState(state, node);
        },
      },
    });

type ChannelRestActionTypes = {
  fetchChannels: RestParamActionType<{ guild_id: number }, ConversationNode[]>;
  fetchChannelConversation: RestParamActionType<
    {
      guild: number;
      node_id: number;
    },
    ConversationNode[]
  >;
  createChannelNode: RestDataActionType<
    Partial<ConversationNode>,
    ConversationNode[]
  >;
  updateChannelNode: RestDataActionType<
    Partial<ConversationNode>,
    ConversationNode[]
  >;
};

export type ChannelActionTypes = RetypeActionTypes<typeof ChannelActions> &
  ChannelRestActionTypes;
export type ChannelGetterTypes = RetypeGetterTypes<typeof ChannelGetters>;
