import { filterKeys } from './base';
import { AxiosResponse } from 'axios';
import {
  ConversationNode,
  QTreeNode,
  conversationNodePatchKeys,
} from '../types';
import {
  ibis_node_type_enum,
  ibis_node_type_type,
  publication_state_enum,
  publication_state_list,
  meta_state_enum,
} from '../enums';
import { defineStore } from 'pinia';
import { calc_threat_status, ThreatMap, ScoreMap } from '../scoring';
import { base_scoring } from '../scoring/base_scoring';

export function ibis_child_types(
  parent_type: ibis_node_type_type,
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

export interface ConversationState {
  full: boolean;
  node?: ConversationNode | null;
  currentQuest?: number | null;
  // currentGuild?: number;
  conversation: ConversationMap;
  neighbourhoodRoot?: number | null;
  neighbourhood: ConversationMap | undefined;
  conversationRoot?: ConversationNode | null;
}

const baseState: ConversationState = {
  full: false,
  node: null,
  currentQuest: null,
  conversation: {},
  neighbourhoodRoot: undefined,
  neighbourhood: {},
  conversationRoot: null,
};

export const useConversationStore = defineStore('conversation', {
  state: () => baseState,
  getters: {
    getConversation: (state: ConversationState): ConversationNode[] =>
      Object.values(state.conversation),
    getConversationNodeById: (state: ConversationState) => (id: number) =>
      state.conversation[id],
    getRootNode: (state: ConversationState) => state.conversationRoot,
    getNeighbourhood: (state: ConversationState): ConversationNode[] =>
      Object.values(state.neighbourhood),
    getFocusNode: (state: ConversationState) => {
      if (state.neighbourhoodRoot && state.neighbourhood) {
        state.neighbourhood[state.neighbourhoodRoot];
      }
    },
    getNeighbourhoodTree: (state: ConversationState) =>
      state.neighbourhood ? makeTree(Object.values(state.neighbourhood)) : null,
    getConversationTree: (state: ConversationState) =>
      state.full
        ? makeTree(
            Object.values(state.conversation),
            publication_state_enum.published,
            false,
          )
        : null,
    getPrivateConversationTree: (state: ConversationState) =>
      makeTree(
        Object.values(state.conversation),
        publication_state_enum.private_draft,
      ),
    getTreeSequence: (state: ConversationState): number[] =>
      depthFirst(
        makeTree(Object.values(state.conversation || state.neighbourhood))[0],
      ),
    getThreatMap() {
      const tree = this.getConversationTree();
      if (tree && tree.length > 0) {
        const threatMap: ThreatMap = {};
        calc_threat_status(tree[0], threatMap);
        return threatMap;
      }
    },
    getPrivateThreatMap: (state: ConversationState): ThreatMap | undefined => {
      const tree = state.getPrivateConversationTree();
      if (tree && tree.length > 0) {
        const threatMap: ThreatMap = {};
        calc_threat_status(tree[0], threatMap);
        return threatMap;
      }
      return;
    },
    getScoreMap: (state: ConversationState) => {
      const tree = state.getConversationTree();
      if (tree && tree.length > 0) {
        const threatMap = state.getThreatMap();
        return base_scoring(tree[0], threatMap);
      }
    },
    getPrivateScoreMap: (state: ConversationState): ScoreMap | undefined => {
      const tree = state.getPrivateConversationTree();
      if (tree && tree.length > 0) {
        const threatMap = state.getPrivateThreatMap();
        return base_scoring(tree[0], threatMap);
      }
    },
    getGuildScoreMap: (state: ConversationState): ScoreMap => {
      const scoreMap = state.getScoreMap() || {};
      const guildScoreMap: ScoreMap = {};
      Object.keys(scoreMap).forEach((key) => {
        const guild_id = state.conversation[key].guild_id;
        guildScoreMap[guild_id] =
          (guildScoreMap[guild_id] || 0) + scoreMap[key];
      });
      return guildScoreMap;
    },
    getPrivateGuildScoreMap: (state: ConversationState): ScoreMap => {
      const scoreMap = state.getPrivateScoreMap() || {};
      const guildScoreMap: ScoreMap = {};
      Object.keys(scoreMap).forEach((key) => {
        const guild_id = state.conversation[key].guild_id;
        guildScoreMap[guild_id] =
          (guildScoreMap[guild_id] || 0) + scoreMap[key];
      });
      return guildScoreMap;
    },
    getNode: (state: ConversationState) => state.node,
    getChildrenOf: (state: ConversationState) => (node_id: number) => {
      return Object.values(state.conversation).filter(
        (n) => n.parent_id == node_id,
      );
    },
    canEdit: (state: ConversationState) => (node_id: number) => {
      const userId = memberStore.getUserId();
      const node = state.conversation[node_id];
      if (
        !(
          node.status == publication_state_enum.private_draft ||
          node.status == publication_state_enum.role_draft ||
          node.status == publication_state_enum.guild_draft ||
          (node.status == publication_state_enum.proposed &&
            baseStore.hasPermission()(
              'publishGameMove',
              node.guild_id,
              node.quest_id,
              node.node_type,
            ))
        )
      ) {
        return false;
      }
      if (node && userId) {
        if (node.creator_id == userId) return true;
        return baseStore.hasPermission()(
          'editConversationNode',
          node.guild_id,
          node.quest_id,
          node.node_type,
        );
      }
      return false;
    },
    canMakeMeta: (state: ConversationState) => (node_id: number) => {
      // you can make a conversation node meta if it has no conversation child
      const node = state.conversation[node_id];
      if (node.meta == 'channel') return false;
      if (node.meta == 'meta') return true;
      return (
        Object.values(state.conversation).filter(
          (n) => n.parent_id == node_id && n.meta == 'conversation',
        ).length == 0
      );
    },
  },
  actions: {
    async ensureConversation(quest_id: number) {
      // maybe allow guildId, min status.
      if (quest_id != this.currentQuest || !this.full) {
        await fetchConversation({ params: { quest_id } });
      }
    },
    async ensureRootNode(quest_id: number | undefined) {
      if (quest_id != this.currentQuest || !this.conversationRoot) {
        await fetchRootNode({ params: { quest_id } });
      }
    },
    async ensureConversationNeighbourhood({
      node_id,
      guild,
    }: {
      node_id: number;
      guild?: number;
    }) {
      if (
        node_id != this.neighbourhoodRoot ||
        Object.keys(this.neighbourhood).length == 0
      ) {
        await fetchConversationNeighbourhood({
          params: { node_id, guild },
        });
      }
    },
    async ensureConversationSubtree({ node_id }: { node_id: number }) {
      if (
        node_id != this.neighbourhoodRoot ||
        Object.keys(this.neighbourhood).length == 0
      ) {
        await this.fetchConversationSubtree({
          node_id,
        });
      }
    },
    resetConversation: () => {
      Object.assign(baseState);
    },
    async fetchConversationNode(params: { id: number }) {
      const res: AxiosResponse<ConversationNode[]> = await api.get(
        `/conversation_node/${params}`,
      );
      if (res.status == 200) {
        const node = res.data[0];
        if (node.meta == 'channel') {
          // maybe we came here through the websocket
          addToState(this.node);
        } else {
          this.node = res.data[0];
          addToState(this.node);
        }
      }
    },
    addToState(node: ConversationNode) {
      this.conversation = { ...this.conversation, [node.id]: node };
      if (!node.parent_id) {
        if (node.meta == meta_state_enum.channel) {
          throw new Error('channels should not be called in conversation');
        } else {
          this.conversationRoot = node;
        }
      }
      if (this.neighbourhoodRoot) {
        const root = this.neighbourhood[state.neighbourhoodRoot];
        if (root && node.ancestry.startsWith(root.ancestry)) {
          this.neighbourhood = { ...this.neighbourhood, [node.id]: node };
        }
      }
    },
    async fetchConversation(params) {
      const res: AxiosResponse = await api.get(
        `/conversation_node?quest_id=eq.${params.quest_id}&meta=not.eq.channel`,
      );
      if (res.status == 200) {
        if (this.currentQuest !== params.quest_id) {
          this.currentQuest = params.quest_id;
          this.neighbourhood = {};
          this.neighbourhoodRoot = null;
        }
        this.conversation = Object.fromEntries(
          res.data.map((node: ConversationNode) => [node.id, node]),
        );
        this.full = true;
        this.conversationRoot = res.data.find(
          (node: ConversationNode) => node.parent_id === null,
        );
      }
    },
    async fetchRootNode(params: { quest_id }) {
      const res: AxiosResponse<ConversationNode[]> = await api.get(
        `/conversation_node?quest_id=eq.${quest_id}&parent_id=is.null&meta=eq.conversation`,
      );
      if (res.status == 200) {
        if (this.currentQuest !== params.quest_id) {
          this.currentQuest = params.quest_id;
          this.conversation = {};
          this.neighbourhood = {};
          this.neighbourhoodRoot = null;
        }
        if (res.data.length) addToState(state, res.data[0]);
      }
    },
    async fetchConversationNeighbourhood(params: {
      node_id: number;
      guild: number;
    }) {
      const res: AxiosResponse<ConversationNode[]> = await api.post(
        `rpc/node_neighbourhood/${params}`,
      );
      const firstNode = res.data[0];
      if (this.currentQuest !== firstNode.quest_id) {
        this.currentQuest = firstNode.quest_id;
        this.conversation = {};
        this.conversationRoot = null;
      }
      this.neighbourhood = Object.fromEntries(
        res.data.map((node: ConversationNode) => [node.id, node]),
      );
      this.neighbourhoodRoot = params.node_id;
      const root = res.data.find(
        (node: ConversationNode) => node.parent_id == null,
      );
      this.conversation = Object.assign(this.conversation, this.neighbourhood);
      if (root) {
        this.conversationRoot = root;
      }
    },
    async fetchConversationSubtree(params: { node_id: number }) {
      const res: AxiosResponse<ConversationNode[]> = await api.post(
        `rpc/node_neighbourhood/${params}`,
      );
      if (res.status == 200) {
        const firstNode = res.data[0];
        if (this.currentQuest !== firstNode.quest_id) {
          this.currentQuest = firstNode.quest_id;
          this.conversation = {};
          this.conversationRoot = null;
        }
        this.neighbourhood = Object.fromEntries(
          res.data.map((node: ConversationNode) => [node.id, node]),
        );
        this.neighbourhoodRoot = params.node_id;
        const root = res.data.find(
          (node: ConversationNode) => node.parent_id == null,
        );
        this.conversation = Object.assign(
          this.conversation,
          this.neighbourhood,
        );
        if (root) {
          this.conversationRoot = root;
        }
      }
    },
    async createConversationNode(data: { node: Partial<ConversationNode> }) {
      const res: AxiosResponse<ConversationNode[]> = await api.post(
        '/conversation_node',
        data,
      );
      if (res.status == 200) {
        state.node = res.data[0];
        addToState(this.node);
      }
    },
    async updateConversationNode(data: { node: Partial<ConversationNode> }) {
      const params = Object();
      params.id = data.node.id;
      data = filterKeys(data, conversationNodePatchKeys);
      const res: AxiosResponse<ConversationNode[]> = await api.patch(
        `/conversation_node/${params}`,
        data,
      );
      const node = res.data[0];
      addToState(node);
    },
  },
});

export function ibis_node_icon(
  node_type: ibis_node_type_type,
  small_icon: boolean,
): string {
  if (small_icon) {
    switch (node_type) {
      case ibis_node_type_enum.question:
        return 'icons/ibis/issue_sm.png';
      case ibis_node_type_enum.answer:
        return 'icons/ibis/position_sm.png';
      case ibis_node_type_enum.con_answer:
        return 'icons/ibis/con_position_sm.png';
      case ibis_node_type_enum.pro:
        return 'icons/ibis/plus_sm.png';
      case ibis_node_type_enum.con:
        return 'icons/ibis/minus_sm.png';
      case ibis_node_type_enum.reference:
        return 'icons/ibis/reference_sm.png';
      case ibis_node_type_enum.quest:
        return 'icons/ibis/challenge_sm.png';
    }
  } else {
    switch (node_type) {
      case ibis_node_type_enum.question:
        return 'icons/ibis/issue.png';
      case ibis_node_type_enum.answer:
        return 'icons/ibis/position.png';
      case ibis_node_type_enum.con_answer:
        return 'icons/ibis/con_position.png';
      case ibis_node_type_enum.pro:
        return 'icons/ibis/plus.png';
      case ibis_node_type_enum.con:
        return 'icons/ibis/minus.png';
      case ibis_node_type_enum.reference:
        return 'icons/ibis/reference.png';
      case ibis_node_type_enum.quest:
        return 'icons/ibis/challenge.png';
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
  include_meta = true,
) {
  if (nodes.length == 0) {
    return [];
  }
  const elements = nodes.map(
    (el) =>
      ({
        children: [],
        label: el.title,
        icon: 'img:' + ibis_node_icon(el.node_type, false),
        ...el,
      }) as QTreeNode,
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
        publication_state_list.indexOf(e1.status),
    );
    roots.splice(0, roots.length, ordered_roots[0]);
  }
  return roots;
}
