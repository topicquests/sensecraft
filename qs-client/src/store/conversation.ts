import {
  MyVapi,
  RestParamActionType,
  RestDataActionType,
  RetypeActionTypes,
  RetypeGetterTypes,
} from "./base";
import { AxiosResponse, AxiosInstance } from "axios";
import { ConversationNode, QTreeNode } from "../types";
import {
  ibis_node_type_enum,
  ibis_node_type_type,
  publication_state_enum,
  publication_state_list,
  meta_state_enum,
} from "../enums";
import { calc_threat_status, ThreatMap, ScoreMap } from "../scoring";
import { base_scoring } from "../scoring/base_scoring";

export function ibis_child_types(
  parent_type: ibis_node_type_type
): ibis_node_type_type[] {
  switch (parent_type) {
    case ibis_node_type_enum.channel:
      return [ibis_node_type_enum.question, ibis_node_type_enum.reference];
    case ibis_node_type_enum.quest:
    case ibis_node_type_enum.question:
      return [
        ibis_node_type_enum.answer,
        ibis_node_type_enum.con_answer,
        ibis_node_type_enum.question,
        ibis_node_type_enum.reference,
      ];
    case ibis_node_type_enum.answer:
    case ibis_node_type_enum.con_answer:
      return [
        ibis_node_type_enum.question,
        ibis_node_type_enum.answer,
        ibis_node_type_enum.con_answer,
        ibis_node_type_enum.con,
        ibis_node_type_enum.pro,
        ibis_node_type_enum.reference,
      ];
    case ibis_node_type_enum.pro:
    case ibis_node_type_enum.con:
      return [
        ibis_node_type_enum.con,
        ibis_node_type_enum.pro,
        ibis_node_type_enum.question,
        ibis_node_type_enum.reference,
      ];
    case ibis_node_type_enum.reference:
      return [
        ibis_node_type_enum.question,
        ibis_node_type_enum.con,
        ibis_node_type_enum.pro,
      ];
  }
}

export interface ConversationMap {
  [key: number]: ConversationNode;
}

export interface ConversationState extends Object {
  full: boolean;
  node?: ConversationNode;
  currentQuest?: number;
  // currentGuild?: number;
  conversation: ConversationMap;
  neighbourhoodRoot?: number;
  neighbourhood: ConversationMap;
  conversationRoot?: ConversationNode;
}

function addToState(state: ConversationState, node: ConversationNode) {
  state.conversation = { ...state.conversation, [node.id]: node };
  if (!node.parent_id) {
    if (node.meta == meta_state_enum.channel) {
      throw new Error("channels should not be called in conversation");
    } else {
      state.conversationRoot = node;
    }
  }
  if (state.neighbourhoodRoot) {
    const root = state.neighbourhood[state.neighbourhoodRoot];
    if (root && node.ancestry.startsWith(root.ancestry)) {
      state.neighbourhood = { ...state.neighbourhood, [node.id]: node };
    }
  }
}
export function ibis_node_icon(
  node_type: ibis_node_type_type,
  small_icon: boolean
): string {
  if (small_icon) {
    switch (node_type) {
      case ibis_node_type_enum.question:
        return "icons/ibis/issue_sm.png";
      case ibis_node_type_enum.answer:
        return "icons/ibis/position_sm.png";
      case ibis_node_type_enum.con_answer:
        return "icons/ibis/con_position_sm.png";
      case ibis_node_type_enum.pro:
        return "icons/ibis/plus_sm.png";
      case ibis_node_type_enum.con:
        return "icons/ibis/minus_sm.png";
      case ibis_node_type_enum.reference:
        return "icons/ibis/reference_sm.png";
      case ibis_node_type_enum.quest:
        return "icons/ibis/challenge_sm.png";
    }
  } else {
    switch (node_type) {
      case ibis_node_type_enum.question:
        return "icons/ibis/issue.png";
      case ibis_node_type_enum.answer:
        return "icons/ibis/position.png";
      case ibis_node_type_enum.con_answer:
        return "icons/ibis/con_position.png";
      case ibis_node_type_enum.pro:
        return "icons/ibis/plus.png";
      case ibis_node_type_enum.con:
        return "icons/ibis/minus.png";
      case ibis_node_type_enum.reference:
        return "icons/ibis/reference.png";
      case ibis_node_type_enum.quest:
        return "icons/ibis/challenge.png";
    }
  }
}

export function depthFirst(tree: QTreeNode, seq: number[] = []): number[] {
  if (!tree) {
    return seq;
  }
  seq.push(tree.id);
  for (const child of tree.children || []) {
    depthFirst(child, seq);
  }
  return seq;
}

export function makeTree(
  nodes: ConversationNode[],
  upToStatus: publication_state_enum = publication_state_enum.obsolete,
  include_meta = true
) {
  if (nodes.length == 0) {
    return [];
  }
  const elements = nodes.map(
    (el) =>
      ({
        children: [],
        label: el.title,
        icon: "img:" + ibis_node_icon(el.node_type, false),
        ...el,
      } as QTreeNode)
  );
  const byId = Object.fromEntries(elements.map((el) => [el.id, el]));
  const roots: QTreeNode[] = [];
  elements.forEach((el) => {
    if (el.meta == meta_state_enum.meta && !include_meta) return;
    if (
      publication_state_list.indexOf(el.status) <
      publication_state_list.indexOf(upToStatus)
    )
      return;
    const parent = el.parent_id ? byId[el.parent_id] : null;
    el.parent = parent;
    if (parent) {
      parent.children.push(el);
    } else {
      roots.push(el);
    }
  });
  // special case: if many roots, choose the one with highest pub status.
  if (roots.length > 1) {
    const ordered_roots = roots.sort(
      (e1, e2) =>
        publication_state_list.indexOf(e2.status) -
        publication_state_list.indexOf(e1.status)
    );
    roots.splice(0, roots.length, ordered_roots[0]);
  }
  return roots;
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
    state.neighbourhood ? makeTree(Object.values(state.neighbourhood)) : null,
  getConversationTree: (state: ConversationState) =>
    state.full
      ? makeTree(
          Object.values(state.conversation),
          publication_state_enum.published,
          false
        )
      : null,
  getPrivateConversationTree: (state: ConversationState) =>
    makeTree(
      Object.values(state.conversation),
      publication_state_enum.private_draft
    ),
  getTreeSequence: (state: ConversationState): number[] =>
    depthFirst(
      makeTree(Object.values(state.conversation || state.neighbourhood))[0]
    ),
  getThreatMap: (state: ConversationState): ThreatMap => {
    const tree = MyVapi.store.getters["conversation/getConversationTree"];
    if (tree && tree.length > 0) {
      const threatMap: ThreatMap = {};
      calc_threat_status(tree[0], threatMap);
      return threatMap;
    }
  },
  getPrivateThreatMap: (state: ConversationState): ThreatMap => {
    const tree =
      MyVapi.store.getters["conversation/getPrivateConversationTree"];
    if (tree && tree.length > 0) {
      const threatMap: ThreatMap = {};
      calc_threat_status(tree[0], threatMap);
      return threatMap;
    }
  },
  getScoreMap: (state: ConversationState): ScoreMap => {
    const tree = MyVapi.store.getters["conversation/getConversationTree"];
    if (tree && tree.length > 0) {
      const threatMap = MyVapi.store.getters["conversation/getThreatMap"];
      return base_scoring(tree[0], threatMap);
    }
  },
  getPrivateScoreMap: (state: ConversationState): ScoreMap => {
    const tree =
      MyVapi.store.getters["conversation/getPrivateConversationTree"];
    if (tree && tree.length > 0) {
      const threatMap =
        MyVapi.store.getters["conversation/getPrivateThreatMap"];
      return base_scoring(tree[0], threatMap);
    }
  },
  getGuildScoreMap: (state: ConversationState): ScoreMap => {
    const scoreMap = MyVapi.store.getters["conversation/getScoreMap"] || {};
    const guildScoreMap: ScoreMap = {};
    Object.keys(scoreMap).forEach((key) => {
      const guild_id = state.conversation[key].guild_id;
      guildScoreMap[guild_id] = (guildScoreMap[guild_id] || 0) + scoreMap[key];
    });
    return guildScoreMap;
  },
  getPrivateGuildScoreMap: (state: ConversationState): ScoreMap => {
    const scoreMap =
      MyVapi.store.getters["conversation/getPrivateScoreMap"] || {};
    const guildScoreMap: ScoreMap = {};
    Object.keys(scoreMap).forEach((key) => {
      const guild_id = state.conversation[key].guild_id;
      guildScoreMap[guild_id] = (guildScoreMap[guild_id] || 0) + scoreMap[key];
    });
    return guildScoreMap;
  },
  getNode: (state: ConversationState) => state.node,
  getChildrenOf: (state: ConversationState) => (node_id: number) => {
    return Object.values(state.conversation).filter(
      (n) => n.parent_id == node_id
    );
  },
  canEdit: (state: ConversationState) => (node_id: number) => {
    const userId = MyVapi.store.getters["member/getUserId"];
    const node = state.conversation[node_id];
    if (
      !(
        node.status == publication_state_enum.private_draft ||
        node.status == publication_state_enum.role_draft ||
        node.status == publication_state_enum.guild_draft
      )
    ) {
      return false;
    }
    if (node && userId) {
      if (node.creator_id == userId) return true;
      return MyVapi.store.getters["hasPermission"](
        "editConversationNode",
        node.guild_id,
        node.quest_id,
        node.node_type
      );
    }
    return false;
  },
  canMakeMeta: (state: ConversationState) => (node_id: number) => {
    // you can make a conversation node meta if it has no conversation child
    const node = state.conversation[node_id];
    if (node.meta == "channel") return false;
    if (node.meta == "meta") return true;
    return (
      Object.values(state.conversation).filter(
        (n) => n.parent_id == node_id && n.meta == "conversation"
      ).length == 0
    );
  },
};

const ConversationActions = {
  ensureConversation: async (context, quest_id: number) => {
    // maybe allow guildId, min status.
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
    { node_id, guild }: { node_id: number; guild?: number }
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
  ensureConversationSubtree: async (
    context,
    { node_id }: { node_id: number }
  ) => {
    if (
      node_id != context.state.neighbourhoodRoot ||
      Object.keys(context.state.neighbourhood).length == 0
    ) {
      await context.dispatch("fetchConversationSubtree", {
        params: { node_id },
      });
    }
  },
  resetConversation: (context) => {
    context.commit("CLEAR_STATE");
  },
};

const baseState: ConversationState = {
  full: false,
  node: null,
  currentQuest: null,
  conversation: {},
  neighbourhoodRoot: null,
  neighbourhood: {},
  conversationRoot: null,
};

export const conversation = (axios: AxiosInstance) =>
  new MyVapi<ConversationState>({
    axios,
    state: baseState,
  })
    // Step 3
    .get({
      action: "fetchConversationNode",
      queryParams: false,
      path: ({ id }: { id: number }) => `/conversation_node?id=eq.${id}`,
      property: "node",
      onSuccess: (
        state: ConversationState,
        res: AxiosResponse<ConversationNode[]>,
        axios: AxiosInstance,
        { params, data }
      ) => {
        const node = res.data[0];
        if (node.meta == "channel") {
          // maybe we came here through the websocket
          MyVapi.store.commit("channel/ADD_TO_STATE", node);
        } else {
          state.node = res.data[0];
          addToState(state, state.node);
        }
      },
    })
    .get({
      path: ({ quest_id }: { quest_id: number }) =>
        `/conversation_node?quest_id=eq.${quest_id}&meta=not.eq.channel`,
      property: "conversation",
      action: "fetchConversation",
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
        return `/conversation_node?quest_id=eq.${quest_id}&parent_id=is.null&meta=eq.conversation`;
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
        if (res.data.length) addToState(state, res.data[0]);
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
        const firstNode = res.data[0];
        if (state.currentQuest !== firstNode.quest_id) {
          state.currentQuest = firstNode.quest_id;
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
    .call({
      path: "node_subtree",
      property: "conversation",
      action: "fetchConversationSubtree",
      readOnly: true,
      onSuccess: (
        state: ConversationState,
        res: AxiosResponse<ConversationNode[]>,
        axios: AxiosInstance,
        { params, data }
      ) => {
        const firstNode = res.data[0];
        if (state.currentQuest !== firstNode.quest_id) {
          state.currentQuest = firstNode.quest_id;
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
        CLEAR_STATE: (state: ConversationState) => {
          Object.assign(state, baseState);
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
      guild: number;
      node_id: number;
    },
    ConversationNode[]
  >;
  fetchConversationSubtree: RestParamActionType<
    {
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
