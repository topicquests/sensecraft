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

  export async function createQuest(quest) {

   return axiosInstance.post("/quests", { 
      name: quest.name,
      handle: quest.handle,
      public: quest.public
     }).then (function(response) {
      return response;
   }). catch(function(error) {
   
      console.log('HEY! Error! in createQuest:', { error });
   });
  }