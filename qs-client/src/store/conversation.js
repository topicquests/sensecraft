import MyVapi from "./base"

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
    path: ({id}) => `/conversation_node?id=eq.${id}`,
    property: "node",
  })
  .get({
    path: ({quest_id}) => `/conversation_node?quest_id=eq.${quest_id}`,
    property: "conversation",
    action: "fetchConversation",
    queryParams: true,
    onSuccess: (state, payload, axios, { params, data }) => {
      if (state.currentQuest !== params.quest_id) {
        state.currentQuest = params.quest_id
        state.neighbourhood = []
        state.neighbourhoodRoot = null
      }
      state.conversation = payload.data
      state.conversationRoot = data.find((node) => node.parent_id === null)
    },
  })
  .get({
    path: ({quest_id}) => {
      return `/conversation_node?quest_id=eq.${quest_id}&parent_id=is.null`
    },
    property: "conversationRoot",
    action: "fetchRootNode",
    // queryParams: true,
    onSuccess: (state, payload, axios, { params, data }) => {
      if (state.currentQuest !== params.quest_id) {
        state.currentQuest = params.quest_id
        state.conversation = []
        state.neighbourhood = []
        state.neighbourhoodRoot = null
      }
      state.conversationRoot = payload.data[0]
    },
  })
  .call({
    path: 'node_neighbourhood',
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
      state.neighbourhood = payload.data
      state.neighbourhoodRoot = params.node_id
    },
  })
  // Step 4
  .getStore({
    getters: {
      getConversation: (state) =>
        state.conversation,
      getConversationNodeById: (state) => (id) =>
        state.conversation.find(node => node.id == id),
      getRootNode: (state) => state.conversationRoot,
      getNeighbourhood: (state) => state.neighbourhood,
      canEdit: (state) => (node_id) => {
        const userId = MyVapi.store.getters["member/getUserId"]
        const node = state.conversation.find(node => node.id == node_id);
        if (node && userId) {
          if (node.state == "draft") {
            return node.creator == userId
          // TODO: role_draft
          } else if (node.state == 'guild_draft') {
            const casting = MyVapi.store.castingInQuest["quest/isPlaying"](node.quest_id)
            return casting?.guild_id == node.guild_id
          } else if (node.state == 'proposed') {
            return MyVapi.store.getters['hasPermission']('guild_admin', node.guild_id, node.quest_id)
          }
          // TODO: Check that the node is under the focus node
        }
        return false;
      },
    },
    actions: {
      resetConversation: (context) => {
        context.commit("RESET_CONVERSATION")
      },
    },
    mutations: {
      RESET_CONVERSATION: (state) => {
        state.conversation = []
        state.conversationRoot = null
        state.neighbourhood = []
        state.neighbourhoodRoot = null
        state.currentQuest = null
      },
    },
  });

export default conversation;
