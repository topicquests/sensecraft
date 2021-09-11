import MyVapi from "./base"

const conversation = new MyVapi({
  state: {
    conversation: [],
    conversationTree: [],
  },
})
  // Step 3
  .get({
    action: "getConversationNodeById",
    queryParams: true,
    path: (id) => `/conversation_node?id=eq.${id}`,
    property: "nodes",
  })
  .get({
    path: '/conversation_node',
    property: "nodes",
    action: "getConversation",
  })
  // Step 4
  .getStore({
    getters: {
      getConversation: (state) =>
        state.conversation,
      getTreeView: (state) =>
        state.conversationTree,
      getConversationNodeById: (state) => (id) =>
        state.conversation.find(node => node.id === id),
      getFirstNode: (state) => (questId) =>
        state.conversation.find(node => node.quest_id === questId && node.guild_id === null),
    }
  });

export default conversation;
