/*
export function someGetter (state) {
}
*/
/*
export function someGetter (state) {
}
*/

export const getGuildByStatus = (state) => (stat) => { 
        
    return state.quilds.filter(guild => guild.status === stat);     
}

export const getGuildById = (state) => (id) => { 
    console.log("Guilds id in getter is ", id);   
    return state.guilds.filter(guilds => guilds.id === id);     
}

export function getGuildByType (state, type)  {   
    return state.guilds.guilds.find(guild => guild.public === type);
}

export function getGuilds (state)  {   
    return state.guilds;  
}      