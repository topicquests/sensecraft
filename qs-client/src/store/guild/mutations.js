
export function SET_GUILD_DATA(state, guild) {
    state.guilds = guild;
}

export function SET_GAME_PLAY_DATA(state, gamePlay) {
    state.gamePlay = gamePlay;
}

export function SET_GUILD_MEMBER_DATA(state, guildMember) {
    state.belongsTo = guildMember;
}