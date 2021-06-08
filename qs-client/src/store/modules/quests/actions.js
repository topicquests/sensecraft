import questService from "../../../services/quest";
import { Notify } from "quasar";
import state from "../../account/state";



export async function findQuests( dispatch, payload) {
  let result = await questService.getQuests(payload).then(function(result){
   return result;
  }).catch(function(error){
   console.log("Error in findQuests");
  })
  console.log({result})
  dispatch('setQuestData', result.data)
};

export async function setQuestData({rootstate, commit}, payload){
  console.log({payload})
  return Promise.resolve(commit('SET_QUEST_DATA', payload.data));
}

export async function createQuests({commit, dispatch}, payload,) {
  let result = await questService.createQuest(payload).then(function(result){
   return result;
  }).catch(function(error){
   console.log("Error in createQuests");
  })
  console.log("createQuest result", {result})
  findQuests;
};

export function increase({ rootcommit }, payload) {
  rootcommit("increase", payload);
}

