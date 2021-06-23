import guildService from "../../services/guild";
import { Notify } from "quasar";


export  function createGuilds({commit, dispatch}, payload,) {
    const token = this.state.auth.accessToken;
    console.log("going through create guilds:", payload, token);
    let result = guildService.createGuild(payload,token)
    .then (function(result) {
        dispatch('findGuilds');
    }).catch(function(error) {
        console.log('Error in createGuild', error)
    })
}

export  function updateGuilds({commit, dispatch}, payload,) {
    const token = this.state.auth.accessToken;
    let result = guildService.updateGuild(payload,token)
    .then (function(result) {
        dispatch('findGuilds');
    }).catch(function(error) {
        console.log('Error in updateGuild', error)
    })
}


export async function findGuilds( {commit}, payload) {
    const token = this.state.auth.accessToken;
    let result =  guildService.getGuilds(payload, token)
        .then(function(result) {
            commit('SET_GUILD_DATA', result.data);
    }).catch(function(error){
        console.log("Error in findGuilds", error);
    })
}

export async function checkBelongsToGuild({state}, id) {
    const token = this.state.auth.accessToken;
    let result = guildService.checkIfMemberBelongsToGuild(id, token)
    .then(function(result) {
        commit('SET_GUILD_MEMBER_DATA', result.data);
    }).catch(function(error) {
        console.log("Error in getting guild/user members");
    })
}

 export function setGuildData({commit}){
    console.log("Guild data: ", {opt})
    return Promise.resolve(commit('SET_GUILD_DATA', opt.data));
}

