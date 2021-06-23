
export function SET_GUILD_DATA(state, guild) {
    state.guilds = guild.data;
}

export function SET_GUILD_MEMBER_DATA(state, guildMember) {
    state.belongsTo = guildMember;
}