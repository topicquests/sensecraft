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
     let tree = [];
     let treeView;
    const conversationTree = this.state.conversation.conversation.map(el => {
        let tre = {}
        tre.id = el.id;
        tre.label = el.title;
        tre.parent_id = el.parent_id;
        return tre;
    });

    console.log("Tre in action: ", conversationTree);

    const idMapping = conversationTree.reduce((acc, el, i) => {
        acc[el.id] = i;
        return acc;
    }, {});

    conversationTree.forEach(el => {
        if(el.parent_id === null) {
            treeView = el;
            return
        }
        const parentEl = conversationTree[idMapping[el.parent_id]];
        parentEl.children = [...(parentEl.children || []), el];
    });
    tree.push(treeView);
    Promise.resolve(commit('CREATE_TREE', tree));
}
export function setConversationNode({commit, getters}, parent_id) {
    const conversation = getters.getConversationNodeById(parent_id)
    return Promise.resolve(commit('SET_PARENT_CONVERSATION' ,conversation))
}


export function setConversationData({commit}) {
    return Promise.resolve(commit('SET_CONVERSATION_DATA, opt.data'))
}
