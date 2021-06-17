import questService from "../../services/quest";
import { Notify } from "quasar";


export  function createQuests({commit, dispatch}, payload,) {
    console.log("Createquest ",  payload.user )
    const token = this.state.auth.accessToken;
    let result = questService.createQuest(payload,token)
    .then (function(result) {
        dispatch('findQuests');
    }).catch(function(error) {
        console.log('Error in createQuest', error)
    })
}  


export async function findQuests( {commit}, payload) {
    const token = this.state.auth.accessToken;
    let result =  questService.getQuests(payload, token)
        .then(function(result) {
            console.log('findQuest result: ', result.data);
            commit('SET_QUEST_DATA', result.data);
    }).catch(function(error){
        console.log("Error in findQuests", error);
    })            
}

 export function setQuestData({commit}){
    console.log({opt})
    return Promise.resolve(commit('SET_QUEST_DATA', opt.data));
} 
/*
export function someAction (context) {
}
*/