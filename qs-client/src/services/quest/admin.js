import { Notify } from "quasar";
import feathersClient from "../../boot/feathersClient";
import axiosInstance from "../../boot/axios";

export async function getQuests(opts) {
    
    return axiosInstance.get("/quests", opts).then(function(response) {
     return response;
   }).catch(function(error){
      console.log("Error in getQuests");
   });
  }

  export async function updateQuest(quest) {

   return axiosInstance.put("/quests", { quest }).then (function(response) {
      return response;
   }). catch(function(error) {
      console.log("Error in updateQuest")
   });
  }

  export  function createQuest(quest, token) {

    return axiosInstance.post("/quests", { 
      quests: quest.quest,
      user: quest.user      
     }, 
    { headers: {
        'Authorization': `Bearer ${token}`
       }
    }).then (function(response) {
      Notify.create({
         message: `New quest was created successfully`,
         color: "positive"
     })
   })
     .catch(err => {
      if (err.response) {
        let errorCode = err.response.data.code;        
          Notify.create({
            message: `There was an error creating new quest. If this issue persists, contact support.`,
            color: "negative"
          });
          console.log ("Error in creating quest ", err.response)
          console.log("Authenentiation token : ", token)
          
        }
    })
   } 