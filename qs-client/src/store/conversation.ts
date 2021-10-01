import {
  MyVapi,
  RestParamActionType,
  RestDataActionType,
  RetypeActionTypes,
  RetypeGetterTypes,
} from "./base";
import { AxiosResponse, AxiosInstance } from "axios";
import { ConversationNode } from "../types";
import { ibis_node_type_enum, publication_state_enum } from "../enums";

interface ConversationMap {
  [key: number]: ConversationNode;
}

export interface ConversationState extends Object {
  full: boolean;
  node?: ConversationNode;
  currentQuest?: number;
  conversation: ConversationMap;
  neighbourhoodRoot?: number;
  neighbourhood: ConversationMap;
  conversationRoot?: ConversationNode;
}

function addToState(state: ConversationState, node: ConversationNode) {
  state.conversation = { ...state.conversation, [node.id]: node };
  if (!node.parent_id) {
    state.conversationRoot = node;
  }
  if (state.neighbourhoodRoot) {
    const root = state.neighbourhood[state.neighbourhoodRoot];
    if (root && node.ancestry.startsWith(root.ancestry)) {
      state.neighbourhood = { ...state.neighbourhood, [node.id]: node };
    }
  }
}

function makeTree(nodes: ConversationNode[]) {
  if (nodes.length == 0) {
    return [];
  }
  const elements = nodes.map((el) => ({
    id: el.id,
    label: el.title,
    parent_id: el.parent_id,
    data: el,
    children: [],
  }));
  const byId = Object.fromEntries(elements.map((el) => [el.id, el]));
  let root = elements[0];
  elements.forEach((el) => {
    if (el.data.ancestry.length < root.data.ancestry.length) {
      root = el;
    }
    if (el.parent_id) {
      const parent = byId[el.parent_id];
      if (parent) {
        parent.children.push(el);
      }
    }
  });
  return [root];
}

const ConversationGetters = {
  getConversation: (state: ConversationState): ConversationNode[] =>
    Object.values(state.conversation),
  getConversationNodeById: (state: ConversationState) => (id: number) =>
    state.conversation[id],
  getRootNode: (state: ConversationState) => state.conversationRoot,
  getNeighbourhood: (state: ConversationState): ConversationNode[] =>
    Object.values(state.neighbourhood),
  getFocusNode: (state: ConversationState) =>
    state.neighbourhood[state.neighbourhoodRoot],
  getNeighbourhoodTree: (state: ConversationState) =>
    makeTree(Object.values(state.neighbourhood)),
  getConversationTree: (state: ConversationState) =>
    makeTree(Object.values(state.conversation)),
  getNode: (state: ConversationState) => state.node,
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
};

const ConversationActions = {
  resetConversation: (context) => {
    context.commit("RESET_CONVERSATION");
  },
  ensureConversation: async (context, quest_id: number) => {
    if (quest_id != context.state.currentQuest || !context.state.full) {
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
};

export const conversation = new MyVapi<ConversationState>({
  state: {
    full: false,
    node: {
      title: "",
      description: "",
      status: "private_draft",
      node_type: "question",
    },
    currentQuest: null,
    conversation: {},
    neighbourhoodRoot: null,
    neighbourhood: {},
    conversationRoot: null,
  } as ConversationState,
})
  // Step 3
  .get({
    action: "fetchConversationNode",
    queryParams: true,
    path: ({ id }: { id: number }) => `/conversation_node?id=eq.${id}`,
    property: "node",
    onSuccess: (
      state: ConversationState,
      res: AxiosResponse<ConversationNode[]>,
      axios: AxiosInstance,
      { params, data }
    ) => {
      state.node = res.data[0];
      addToState(state, state.node);
    },
  })
  .get({
    path: ({ quest_id }: { quest_id: number }) =>
      `/conversation_node?quest_id=eq.${quest_id}`,
    property: "conversation",
    action: "fetchConversation",
    queryParams: true,
    onSuccess: (
      state: ConversationState,
      res: AxiosResponse<ConversationNode[]>,
      axios: AxiosInstance,
      { params, data }
    ) => {
      if (state.currentQuest !== params.quest_id) {
        state.currentQuest = params.quest_id;
        state.neighbourhood = {};
        state.neighbourhoodRoot = null;
      }
      state.conversation = Object.fromEntries(
        res.data.map((node: ConversationNode) => [node.id, node])
      );
      state.full = true;
      state.conversationRoot = res.data.find(
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
    onSuccess: (
      state: ConversationState,
      res: AxiosResponse<ConversationNode[]>,
      axios: AxiosInstance,
      { params, data }
    ) => {
      if (state.currentQuest !== params.quest_id) {
        state.currentQuest = params.quest_id;
        state.conversation = {};
        state.neighbourhood = {};
        state.neighbourhoodRoot = null;
      }
      addToState(state, res.data[0]);
    },
  })
  .call({
    path: "node_neighbourhood",
    property: "conversation",
    action: "fetchConversationNeighbourhood",
    readOnly: true,
    onSuccess: (
      state: ConversationState,
      res: AxiosResponse<ConversationNode[]>,
      axios: AxiosInstance,
      { params, data }
    ) => {
      if (state.currentQuest !== params.quest_id) {
        state.currentQuest = params.quest_id;
        state.conversation = {};
        state.conversationRoot = null;
      }
      state.neighbourhood = Object.fromEntries(
        res.data.map((node: ConversationNode) => [node.id, node])
      );
      state.neighbourhoodRoot = params.node_id;
      const root = res.data.find(
        (node: ConversationNode) => node.parent_id == null
      );
      state.conversation = Object.assign(
        state.conversation,
        state.neighbourhood
      );
      if (root) {
        state.conversationRoot = root;
      }
    },
  })
  .post({
    action: "createConversationNode",
    path: "/conversation_node",
    onSuccess: (
      state: ConversationState,
      res: AxiosResponse<ConversationNode[]>,
      axios: AxiosInstance,
      { params, data }
    ) => {
      state.node = res.data[0];
      addToState(state, state.node);
    },
  })
  .patch({
    action: "updateConversationNode",
    path: ({ id }: { id: number }) => `/conversation_node?id=eq.${id}`,
    beforeRequest: (state, { params, data }) => {
      params.id = data.id;
      data.updated_at = undefined;
    },
    onSuccess: (
      state: ConversationState,
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
    getters: ConversationGetters,
    actions: ConversationActions,
    mutations: {
      RESET_CONVERSATION: (state: ConversationState) => {
        state.full = false;
        state.conversation = {};
        state.conversationRoot = null;
        state.neighbourhood = {};
        state.neighbourhoodRoot = null;
        state.currentQuest = null;
      },
    },
  });

type ConversationRestActionTypes = {
  fetchConversationNode: RestParamActionType<
    { id: number },
    ConversationNode[]
  >;
  fetchConversation: RestParamActionType<
    { quest_id: number },
    ConversationNode[]
  >;
  fetchRootNode: RestParamActionType<{ quest_id: number }, ConversationNode[]>;
  fetchConversationNeighbourhood: RestParamActionType<
    {
      quest_id: number;
      node_id: number;
    },
    ConversationNode[]
  >;
  createConversationNode: RestDataActionType<
    Partial<ConversationNode>,
    ConversationNode[]
  >;
  updateConversationNode: RestDataActionType<
    Partial<ConversationNode>,
    ConversationNode[]
  >;
};

export type ConversationActionTypes = RetypeActionTypes<
  typeof ConversationActions
> &
  ConversationRestActionTypes;
export type ConversationGetterTypes = RetypeGetterTypes<
  typeof ConversationGetters
>;
