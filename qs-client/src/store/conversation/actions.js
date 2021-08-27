import conversationService from "../../services";

export async function addConversation ({commit, dispatch}, payload) {
    try {
        const token = this.state.member.token;
        let response = await conversationService.addConversation(payload, token)
        dispatch('getConversationByQuestId', payload.quest_id);
        return response.data
    }
    catch (error) {
        console.log("error in adding conversation", error)
    }
}
export async function getConversationByQuestId ({commit, dispatch}, payload) {
    try {
        const token = this.state.member.token;
        let response = await conversationService.getConversationByQuestId(payload, token)
        commit('SET_CONVERSATION_DATA', response.data);
        return response.data
    }
    catch (error) {
        console.log("error in getting conversation", error)
    }
}
export async function createConversationTree({commit, state}) {
    const tree = [];
    const viewById = {};
    debugger;
    this.state.conversation.conversation.forEach(el => {
        viewById[el.id] = {
            id: el.id,
            node: el,
            label: el.title,
            children: [],
        };
    });
    Object.values(viewById).forEach(el => {
        const parent_id = el.node.parent_id;
        if (parent_id == null) {
            tree.push(el);
        } else {
            const parent = viewById[parent_id];
            parent.children.push(el);
        }
    });
    Promise.resolve(commit('CREATE_TREE', tree));
}
export function setConversationNode({commit, getters}, parent_id) {
    const conversation = getters.getConversationNodeById(parent_id)
    return Promise.resolve(commit('SET_PARENT_CONVERSATION' ,conversation))
}


export function setConversationData({commit}) {
    return Promise.resolve(commit('SET_CONVERSATION_DATA, opt.data'))
}
