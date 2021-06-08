import questService from "../../services/quest";
import { Notify } from "quasar";


export default {
    state: {
        quests: {
            handle: null,
            name: null,
            pub: false,
            status: null
          }
        },

    getters: {
        getQuestByStatus: state => stat => { 
        
            return state.quests.filter(quests => quests.status === stat);     
        },
    
       getQuestByType (state, type)  {   
            return state.quest.quests.find(quest => quest.public === type);
        },
    
        getQuests (state)   {   
            return state.quests;  
        }        
    },
    
    actions: {          
    
        findQuests( {commit}, payload) {
            let result =  questService.getQuests(payload).then(function(result) {
                commit('SET_QUEST_DATA', result.data);
            }).catch(function(error){
                console.log("Error in findQuests", error);
            })            
        },
      
         setQuestData({commit}){
            console.log({opt})
            return Promise.resolve(commit('SET_QUEST_DATA', opt.data));
        },
      
        async  createQuests({commit, dispatch}, payload,) {
            let result = await questService.createQuest(payload).then(function(result){
                dispatch('findQuests');
            }).catch(function(error){
                console.log("Error in createQuests"), error;
            })     
        },
      
        
    },

    mutations: {
        SET_QUEST_DATA(state, quest) {
            state.quests = quest.data;
        }        
        
    }
}
