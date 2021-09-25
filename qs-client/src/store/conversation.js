import MyVapi from "./base";

const conversation = new MyVapi({
  state: {
    node: null,
    currentQuest: null,
    conversation: [],
    neighbourhoodRoot: null,
    neighbourhood: [],
    conversationRoot: null,
  },
})
  // Step 3
  .get({
    action: "fetchConversationNode",
    queryParams: true,
    path: ({ id }) => `/conversation_node?id=eq.${id}`,
    property: "node",
  })
  .get({
    path: ({ quest_id }) => `/conversation_node?quest_id=eq.${quest_id}`,
    property: "conversation",
    action: "fetchConversation",
    queryParams: true,
    onSuccess: (state, payload, axios, { params, data }) => {
      if (state.currentQuest !== params.quest_id) {
        state.currentQuest = params.quest_id;
        state.neighbourhood = [];
        state.neighbourhoodRoot = null;
      }
      state.conversation = payload.data;
      state.conversationRoot = data.find((node) => node.parent_id === null);
    },
  })
  .get({
    path: ({ quest_id }) => {
      return `/conversation_node?quest_id=eq.${quest_id}&parent_id=is.null`;
    },
    property: "conversationRoot",
    action: "fetchRootNode",
    onSuccess: (state, payload, axios, { params, data }) => {
      if (state.currentQuest !== params.quest_id) {
        state.currentQuest = params.quest_id;
        state.conversation = [];
        state.neighbourhood = [];
        state.neighbourhoodRoot = null;
      }
      state.conversationRoot = payload.data[0];
    },
  })
  .call({
    path: "node_neighbourhood",
    property: "conversation",
    action: "fetchConversationNeighbourhood",
    readOnly: true,
    onSuccess: (state, payload, axios, { params, data }) => {
      /*
      if (state.currentQuest !== params.quest_id) {
        state.currentQuest = params.quest_id
        state.conversation = []
        state.conversationRoot = null
      }
      */
      state.neighbourhood = payload.data;
      state.neighbourhoodRoot = params.node_id;
    },
  })
  .post({
    action: "createConversationNode",
    path: "/conversation_node",
    onSuccess: (state, res, axios, { params, data }) => {
      state.node = res.data[0];
      if (!state.node.parent) {
        state.conversationRoot = state.node;
      }
    },
  })
  .patch({
    action: "updateConversationNode",
    path: ({ id }) => `/conversation_node?id=eq.${id}`,
    beforeRequest: (state, { params, data }) => {
      console.log(params, data);
      params.id = data.id;
      data.updated_at = undefined;
    },
    onSuccess: (state, res, axios, { data }) => {
      const node = res.data[0];
      const conversation = state.conversation.filter((q) => q.id !== node.id);
      conversation.push(node);
      state.conversation = conversation;
      state.node = node;
      if (!node.id) {
        state.conversationRoot = node;
      }
    },
  })
  // Step 4
  .getStore({
    getters: {
      getConversation: (state) => state.conversation,
      getConversationNodeById: (state) => (id) =>
        state.conversation.find((node) => node.id == id),
      getRootNode: (state) => state.conversationRoot,
      getNeighbourhood: (state) => state.neighbourhood,
      canEdit: (state) => (node_id) => {
        const userId = MyVapi.store.getters["member/getUserId"];
        const node = state.conversation.find((node) => node.id == node_id);
        if (node && userId) {
          if (node.state == "draft") {
            return node.creator == userId;
            // TODO: role_draft
          } else if (node.state == "guild_draft") {
            const casting = MyVapi.store.castingInQuest["quest/isPlaying"](
              node.quest_id
            );
            return casting?.guild_id == node.guild_id;
          } else if (node.state == "proposed") {
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
      ensureConversation: async (context, quest_id) => {
        if (
          quest_id != context.state.currentQuest ||
          context.state.conversation.length == 0
        ) {
          await context.dispatch("fetchConversation", { params: { quest_id } });
        }
      },
      ensureRootNode: async (context, quest_id) => {
        if (
          quest_id != context.state.currentQuest ||
          !context.state.conversationRoot
        ) {
          await context.dispatch("fetchRootNode", { params: { quest_id } });
        }
      },
      ensureConversationNeighbourhood: async (context, node_id, guild) => {
        if (
          node_id != context.state.neighbourhoodRoot ||
          context.state.neighbourhood.length == 0
        ) {
          await context.dispatch("fetchConversationNeighbourhood", {
            params: { node_id, guild },
          });
        }
      },
    },
    mutations: {
      RESET_CONVERSATION: (state) => {
        state.conversation = [];
        state.conversationRoot = null;
        state.neighbourhood = [];
        state.neighbourhoodRoot = null;
        state.currentQuest = null;
      },
    },
  });

export default conversation;
