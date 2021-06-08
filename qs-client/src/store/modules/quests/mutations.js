import state from "../../account/state";

 export function SET_QUEST_DATA(state, quest) {
    state.quest = quest;
  }
  
  export function increase(rootstate, payload) {
    rootstate.count += payload.amount;
  }