import MyVapi from "./base";
import { ConversationNode } from "../types";
import { ibis_node_type_enum, publication_state_enum } from "../enums";

interface ConversationMap {
  [key: number]: ConversationNode;
}

export interface ConversationState extends Object {
  node?: ConversationNode;
  currentQuest?: number;
  conversation: ConversationMap;
  neighbourhoodRoot?: number;
  neighbourhood: ConversationMap;
  conversationRoot?: ConversationNode;
}

export const conversation = new MyVapi<ConversationState>({
  state: {
    node: null,
    currentQuest: null,
    conversation: {},
    neighbourhoodRoot: null,
    neighbourhood: {},
    conversationRoot: null,
  },
})
  // Step 3
  .get({
    action: "fetchConversationNode",
    queryParams: true,
    path: ({ id }: { id: number }) => `/conversation_node?id=eq.${id}`,
    property: "node",
    onSuccess: (state: ConversationState, payload, axios, { params, data }) => {
      state.node = payload.data[0];
      if (state.neighbourhoodRoot) {
        const neighbourhoodRoot = state.neighbourhood[state.neighbourhoodRoot];
        if (
          neighbourhoodRoot &&
          state.node.ancestry.startsWith(neighbourhoodRoot.ancestry)
        ) {
          state.neighbourhood = {
            ...state.neighbourhood,
            [state.node.id]: state.node,
          };
        }
      }
    },
  })
  .get({
    path: ({ quest_id }: { quest_id: number }) =>
      `/conversation_node?quest_id=eq.${quest_id}`,
    property: "conversation",
    action: "fetchConversation",
    queryParams: true,
    onSuccess: (state: ConversationState, payload, axios, { params, data }) => {
      if (state.currentQuest !== params.quest_id) {
        state.currentQuest = params.quest_id;
        state.neighbourhood = {};
        state.neighbourhoodRoot = null;
      }
      state.conversation = Object.fromEntries(
        payload.data.map((node: ConversationNode) => [node.id, node])
      );
      state.conversationRoot = payload.data.find(
        (node: ConversationNode) => node.parent_id === null
      );
    },
  })
  .get({
    path: ({ quest_id }: { quest_id: number }) => {
      return `/conversation_node?quest_id=eq.${quest_id}&parent_id=is.null`;
    },
    property: "conversationRoot",
    action: "fetchRootNode",
    onSuccess: (state: ConversationState, payload, axios, { params, data }) => {
      if (state.currentQuest !== params.quest_id) {
        state.currentQuest = params.quest_id;
        state.conversation = {};
        state.neighbourhood = {};
        state.neighbourhoodRoot = null;
      }
      state.conversationRoot = payload.data[0] as ConversationNode;
      // add to neighbourhood if appropriate?
    },
  })
  .call({
    path: "node_neighbourhood",
    property: "conversation",
    action: "fetchConversationNeighbourhood",
    readOnly: true,
    onSuccess: (state: ConversationState, payload, axios, { params, data }) => {
      /*
      if (state.currentQuest !== params.quest_id) {
        state.currentQuest = params.quest_id
        state.conversation = {}
        state.conversationRoot = null
      }
      */
      state.neighbourhood = Object.fromEntries(
        payload.data.map((node: ConversationNode) => [node.id, node])
      );
      state.neighbourhoodRoot = params.node_id;
      const root = payload.data.find(
        (node: ConversationNode) => node.parent_id == null
      );
      if (root) {
        state.conversationRoot = root;
      }
    },
  })
  .post({
    action: "createConversationNode",
    path: "/conversation_node",
    onSuccess: (state: ConversationState, res, axios, { params, data }) => {
      state.node = res.data[0] as ConversationNode;
      if (!state.node.parent_id) {
        state.conversationRoot = state.node;
      }
    },
  })
  .patch({
    action: "updateConversationNode",
    path: ({ id }: { id: number }) => `/conversation_node?id=eq.${id}`,
    beforeRequest: (state, { params, data }) => {
      params.id = data.id;
      data.updated_at = undefined;
    },
    onSuccess: (state: ConversationState, res, axios, { data }) => {
      const node = res.data[0];
      state.conversation = { ...state.conversation, [node.id]: node };
      state.node = node;
      if (!node.parent_id) {
        state.conversationRoot = node;
      }
    },
  })
  // Step 4
  .getVuexStore({
    getters: {
      getConversation: (state: ConversationState): ConversationNode[] =>
        Object.values(state.conversation),
      getConversationNodeById: (state: ConversationState) => (id: number) =>
        state.neighbourhood[id] ||
        state.conversation[id] ||
        ((state.conversationRoot?.id == id
          ? state.conversationRoot
          : null) as ConversationNode),
      getRootNode: (state: ConversationState) => state.conversationRoot,
      getNeighbourhood: (state: ConversationState): ConversationNode[] =>
        Object.values(state.neighbourhood),
      getFocusNode: (state: ConversationState) =>
        state.neighbourhood[state.neighbourhoodRoot],
      canEdit: (state: ConversationState) => (node_id: number) => {
        const userId = MyVapi.store.getters["member/getUserId"];
        const node = state.conversation[node_id];
        if (node && userId) {
          if (node.status == publication_state_enum.private_draft) {
            return node.creator == userId;
            // TODO: role_draft
          } else if (node.status == publication_state_enum.guild_draft) {
            const casting = MyVapi.store.getters["quests/castingInQuest"](
              node.quest_id
            );
            return casting?.guild_id == node.guild_id;
          } else if (node.status == publication_state_enum.proposed) {
            return MyVapi.store.getters["hasPermission"](
              "guild_admin",
              node.guild_id,
              node.quest_id
            );
          }
          // TODO: Check that the node is under the focus node
        }
        return false;
      },
    },
    actions: {
      resetConversation: (context) => {
        context.commit("RESET_CONVERSATION");
      },
      ensureConversation: async (context, quest_id: number) => {
        if (
          quest_id != context.state.currentQuest ||
          Object.keys(context.state.conversation).length == 0
        ) {
          await context.dispatch("fetchConversation", { params: { quest_id } });
        }
      },
      ensureRootNode: async (context, quest_id: number) => {
        if (
          quest_id != context.state.currentQuest ||
          !context.state.conversationRoot
        ) {
          await context.dispatch("fetchRootNode", { params: { quest_id } });
        }
      },
      ensureConversationNeighbourhood: async (
        context,
        { node_id, guild }: { node_id: number; guild: number }
      ) => {
        if (
          node_id != context.state.neighbourhoodRoot ||
          Object.keys(context.state.neighbourhood).length == 0
        ) {
          await context.dispatch("fetchConversationNeighbourhood", {
            params: { node_id, guild },
          });
        }
      },
    },
    mutations: {
      RESET_CONVERSATION: (state: ConversationState) => {
        state.conversation = {};
        state.conversationRoot = null;
        state.neighbourhood = {};
        state.neighbourhoodRoot = null;
        state.currentQuest = null;
      },
    },
  });
