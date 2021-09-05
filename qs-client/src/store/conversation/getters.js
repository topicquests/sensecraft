import conversation from ".";
import state from "../quest/state";

export const getConversation = (state) => (stat) => {

    return state.conversation;
}
export function getTreeView(state) {
    return state.conversationTree
}
export const getConversationNodeById = (state) => (id) => {
    return state.conversation.filter(conversation => conversation.id === id);
}
export const getFirstNode = (state) => (questId) => {
    return state.conversation.filter(node => node.quest_id === questId && node.guild_id === null)
}