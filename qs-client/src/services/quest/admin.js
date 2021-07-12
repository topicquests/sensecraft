import { Notify } from "quasar";
import axiosInstance from "../../boot/axios";

export async function getQuests(opts, token) {
  const options = token ? {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  } : {};
  return axiosInstance.get("/quests", options
  ).then(function(response) {
     return response;
   }).catch(function(error){
      console.log("Error in getQuests");
   });
  }

  export async function updateQuest(quest, token) {
    const options = token ? {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    } : {};
    const id = quest.id;
    return axiosInstance.put(`/quests?id=eq.${id}`, quest, options
    ).then(response => response).catch(err => {
      if (err.response) {
        let errorCode = err.response.data.code;
        console.log("Error in creating quest ", err.response);
      }
    });
}

  export  function createQuest(quest, token) {
    const options = token ? {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    } : {};
    return axiosInstance.post("/quests", {
      "name": quest.name,
       "handle": quest.handle,
       "description": quest.description,
       "public": quest.public,
       "createdAt": quest.createdAt,
       "updatedAt": quest.updatedAt
    }, options
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