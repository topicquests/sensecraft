/*
export function someGetter (state) {
}
*/

export const getQuestByStatus = (state) => (stat) => { 
        
    return state.quests.filter(quests => quests.status === stat);     
}

export const getQuestById = (state) => (id) => { 
        
    return state.quests.filter(quests => quests.id === id);     
}

export function getQuestByType (state, type)  {   
    return state.quest.quests.find(quest => quest.public === type);
}

export function getQuests (state)  {   
    return state.quests;  
}      