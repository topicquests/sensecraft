export function SET_CONVERSATION_DATA(state, conversation) {
    state.conversation = conversation;
}
export function SHOW_TREE(state, show) {

    state.showTree = show;
}
export function CREATE_TREE(state, tree) {
    state.conversationTree = tree;
}
export function SET_PARENT_NODE(state, parentNode) {
    state.parentNode = parentNode;
}
export function SET_NODE(state, node) {
    state.node = node;
}
