
export const getConversation = (state) => (stat) => {

    return state.conversation;
}
export function getTreeView(state) {
    return state.conversationTree
}
export const getConversationNodeById = (state) => (id) => {
    return state.conversation.filter(conversation => conversation.id === id);
}