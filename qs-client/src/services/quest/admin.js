import { Notify } from "quasar";
import axiosInstance from "../../boot/axios";

export async function getQuests(opts, token) {
    
    return axiosInstance.get("/quests",
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  ).then(function(response) {
    console.log("Quest response: ", response);
     return response;
   }).catch(function(error){
      console.log("Error in getQuests");
   });
  }

  export async function updateQuest(quest, token) {
    const id = quest.id;

   return axiosInstance.put(`/quests/${id}`, quest, 
   {
   headers: {
    'Authorization': `Bearer ${token}`
   }
  }).then (function(response) {
    Notify.create({
      message: `Quest was updated successfully`,
      color: "positive"
  });
      return response;
   }).catch(err => {
    if (err.response) {
      let errorCode = err.response.data.code;        
        Notify.create({
          message: `There was an error updating quest. If this issue persists, contact support.`,
          color: "negative"
        });
        console.log ("Error in creating quest ", err.response)
        console.log("Authenentiation token : ", token)
      }        
    })
  }

  export  function createQuest(quest, token) {

    return axiosInstance.post("/quests", quest,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    ).then (function(response) {
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