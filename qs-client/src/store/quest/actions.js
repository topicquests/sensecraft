import questService from "../../services";
import { Notify } from "quasar";


export  function createQuests({commit, dispatch}, payload,) {
    const token = this.state.member.token;
    let today = new Date;
    today = today.toISOString()
    payload.created_at = today;
    payload.updated_at = today;
    console.log("Createquest ",  payload.member )
    let result = questService.createQuest(payload,token)
    .then (function(result) {
        dispatch('findQuests');
    }).catch(function(error) {
        console.log('Error in createQuest', error)
    })
}
export  async function updateQuests({commit, dispatch}, payload,) {
    try {
        const token = this.state.member.token;
        let today = new Date;
        payload.updated_at = today;
    today = today.toISOString()
        let result = await questService.updateQuest(payload,token)
        return (result)
    }
    catch (err) {

    }
}
export async function findQuests( {commit}) {
    try {
    const token = this.state.member.token;
    let result =  await questService.getQuests(token)
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
    let result =  await questService.getQuestById(questId, token)
    return (result.data[0]);
    }
    catch(error) {
        console.log("get quest by id error: ", error);
    }
}

export function setCurrentQuest({commit, getters}, questId) {
    let quest = getters.getQuestById(questId)
    return Promise.resolve(commit('SET_CURRENT_QUEST', quest[0]))
}

 export function setQuestData({commit}){
    console.log("Quest data: ", {opt})
    return Promise.resolve(commit('SET_QUEST_DATA', opt.data));
}
