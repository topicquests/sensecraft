/*
export function someMutation (state) {
}
*/
export function SET_QUEST_DATA(state, quest) {
    state.quests = quest;
}

export function SET_CURRENT_QUEST(state, quest) {
    state.currentQuest = quest;
}