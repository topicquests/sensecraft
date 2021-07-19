import questService from "../../services/quest";
import { Notify } from "quasar";


export  function createQuests({commit, dispatch}, payload,) {
    const token = this.state.user.token;
    let today = new Date;
    today = today.toISOString()
    payload.createdAt = today;
    payload.updatedAt = today;
    console.log("Createquest ",  payload.user )
    let result = questService.createQuest(payload,token)
    .then (function(result) {
        dispatch('findQuests');
    }).catch(function(error) {
        console.log('Error in createQuest', error)
    })
}

export  async function updateQuests({commit, dispatch}, payload,) {
    try {
        const token = this.state.user.token;
        let today = new Date;
        payload.updatedAt = today;
    today = today.toISOString()
        let result = await questService.updateQuest(payload,token)
        return (result)
    }
    catch (err) {

    }

}


export async function findQuests( {commit}, payload) {
    try {
    const token = this.state.auth.accessToken;
    let result =  await questService.getQuests(payload, token)
    commit('SET_QUEST_DATA', result.data);
    return (result);
    }
    catch(error) {
        console.log("findQuest error: ", error);
    }

}

export async function getQuestById( {commit}, questId) {
    try {
    const token = this.state.auth.accessToken;
    let result =  await questService.getQuestsById(questId, token)
    return (result.data);
    }
    catch(error) {
        console.log("get quest by id error: ", error);
    }

}

 export function setQuestData({commit}){
    console.log("Quest data: ", {opt})
    return Promise.resolve(commit('SET_QUEST_DATA', opt.data));
}
/*
export function someAction (context) {
}
*/