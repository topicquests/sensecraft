export function SET_CONVERSATION_DATA(state, conversation) {
    state.conversation = conversation;
}
export function SHOW_TREE(state, show) {
    state.showTree = show;
}
export function CREATE_TREE(state, tree) {
    state.conversationTree = tree;
}
export function SET_PARENT_CONVERSATION(state, parentConversation) {
    state.parentConversation = parentConversation;
}
