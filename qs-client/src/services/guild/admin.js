import { Notify } from "quasar";
import axiosInstance from "../../boot/axios";

export async function getGuilds(opts, token) {
    return axiosInstance.get("/guilds",
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  ).then(function(response) {
    console.log("Guild response: ", response);
     return response;
   }).catch(function(error){
      console.log("Error in getGuild");
   });
  }

  export async function updateGuild(guild, token) {
    const id = guild.id;

   return axiosInstance.put(`/guilds/${id}`, guild,
   {
   headers: {
    'Authorization': `Bearer ${token}`
   }
  }).then (function(response) {
    Notify.create({
      message: `Guild was updated successfully`,
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
        console.log ("Error in updating guild ", err.response)
        console.log("Authenentiation token : ", token)
      }
    })
  }

  export  function createGuild(guild, token) {
    return axiosInstance.post("/guilds", guild,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    ).then (function(response) {
      Notify.create({
         message: `New guild was created successfully`,
         color: "positive"
     })
   })
     .catch(err => {
      if (err.response) {
        let errorCode = err.response.data.code;
          Notify.create({
            message: `There was an error creating new guild. If this issue persists, contact support.`,
            color: "negative"
          });
          console.log ("Error in creating guild ", err.response)
          console.log("Authenentiation token : ", token)
        }
    })
   }

   export function checkMemberBelongsToGuild(userId, guildId) {

   }