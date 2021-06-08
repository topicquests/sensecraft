export async function  getQuestByStatus (state, status)   {   
        return state.quest.quests.find(quest => quest.status === status);     
}

export async function  getQuestByType (state, type)  {   
        return state.quest.quests.find(quest => quest.public === type);
}

export async function  getQuests (state, status)   {   
        return state.quest.quests;  
}
