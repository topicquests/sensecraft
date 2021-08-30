import guildService from "../../services";
import { Notify } from "quasar";


export  function createGuilds({commit, dispatch}, payload,) {
    const token = this.state.member.token;
    let today = new Date;
  today = today.toISOString()
  payload.created_at = today;
  payload.updated_at = today;
    console.log("going through create guilds:", payload, token);
    let result = guildService.createGuild(payload,token)
    .then (function(result) {
        dispatch('findGuilds');
    }).catch(function(error) {
        console.log('Error in createGuild', error)
    })
}

export  function updateGuilds({commit, dispatch}, payload,) {
    const token = this.state.member.token;
    let result = guildService.updateGuild(payload,token)
    .then (function(result) {
        dispatch('findGuilds');
    }).catch(function(error) {
        console.log('Error in updateGuild', error)
    })
}

export async function getGuildById( {commit}, payload) {
    try {
        const token = this.state.member.token;
        let result =  await guildService.getGuildById(payload, token)
        commit('SET_GUILD_MEMBER_DATA', result.data);
        return (result.data)
    }
    catch(error){
        console.log("Error in findGuilds", error);
    }
}

export async function getMemberByGuildIdandUserId( {commit}, payload) {
    try {
        const token = this.state.member.token;
        let result =  await guildService.getMemberByGuildIdandUserId(payload, token)
        commit('SET_GUILD_MEMBER_DATA', result.data);
        return (result.data)
    }
    catch(error){
        console.log("Error in findGuilds", error);
    }
}

export async function findGuilds( {commit}, payload) {
    try {
        const token = this.state.member.token;
        let result =  await guildService.getGuilds(payload, token)
        commit('SET_GUILD_DATA', result.data);
        return (result)
    }
    catch(error){
        console.log("Error in findGuilds", error);
    }
}

export async function checkBelongsToGuild({state, commit}, id) {
    try {
    const token = this.state.member.token;
    let result = await guildService.checkIfMemberBelongsToGuild(id, token)
        commit('SET_GUILD_MEMBER_DATA', result.data);
        return (result)
    }
    catch(error) {
        console.log("Error in getting guild/member members", error);
    }
}

export async function joinGuild({commit, state}, guildId) {
    try {
        const token = this.state.member.token;
        const userId = this.state.member.member.id;
        let response = await guildService.joinGuild(guildId, userId, token)
        return (response)
    }
    catch (error) {
        console.log("Error with member joing guild ", error)
    }

}

export async function getMembersByGuildId({state, commit}, id) {
    try {
    const token = this.state.member.token;
    let result = await guildService.getGuildMembersById(id, token)
    return (result.data)
    }
    catch(error) {
        console.log("Error in getting guild/member members", error);
    }
}
export async function registerQuest({commit, state}, payload) {
    try {
        const token = this.state.member.token;
        let response = await guildService.registerQuest(payload, token)
        return (response)
    }
    catch (error) {
        console.log("Error with registering quest ", error)
    }
}

    export async function getGamePlayByGuildId ({commit, dispatch}, payload) {
        try {
            const token = this.state.member.token;
            let response = await guildService.getGamePlayByGuildId(payload, token)
            commit('SET_GAME_PLAY_DATA', response.data[0]);
            return response.data
        }
        catch (error) {
            console.log("error in get game play by guild id", error)

        }
    }
    export async function registerAllMembersToQuest({commit, dispatch}, params, token) {
        try {
            const token = this.state.member.token;
            let response = await guildService.registerAllMembersToQuest(params, token)
            return response
        }
        catch(error) {
            console.log("Error in registering all members to quest: ", error)
        }
    }
    export function setCurrentGuild({commit, getters}, guildId) {
        let guild = getters.getGuildById(guildId)
        return Promise.resolve(commit('SET_CURRENT_GUILD', guild[0]))
    }

    export async function registerAllMembersToQuest({commit, dispatch}, params, token) {
        try {
            const token = this.state.member.token;
            let response = await guildService.registerAllMembersToQuest(params, token)
            return response
        }
        catch(error) {
            console.log("Error in registering all members to quest: ", error)
        }
    }

    export function setCurrentGuild({commit, getters}, guildId) {
        let guild = getters.getGuildById(guildId)
        return Promise.resolve(commit('SET_CURRENT_GUILD', guild[0]))
    }

 export function setGuildData({commit}){
    console.log("Guild data: ", {opt})
    return Promise.resolve(commit('SET_GUILD_DATA', opt.data));
}
export function setGamePlayData({commit}) {
    return Promise.resolve(commit('SET_GAME_PLAY_DATA, opt.data'))
}

