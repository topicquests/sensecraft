import MyVapi from "./base"

const guilds = new MyVapi({
  state: {
    currentGuild: null,
    guilds: []
  },
})
  // Step 3
  .get({
    action: "fetchGuildById",
    path: '/guilds',
    queryParams: true,
    beforeRequest: (state, {params}) => {
      params.id = `eq.${params.id}`
      const userId = MyVapi.store.getters["member/getUserId"]
      if (userId) {
        actionParams.params = {
          select: '*,game_play(*),guild_membership(*)',
          'guild_membership.member_id': `eq.${userId}`
        }
      } else {
        actionParams.params = {
          select: '*,game_play(*)'
        }
      }
    },
    onSuccess: (state, res, axios, actionParams) => {
      guild = res.data[0]
      if (state.guilds) {
        const guilds = state.guilds.filter(q => q.id !== guild.id)
        guilds.push(guild)
        state.guilds = guilds
      } else {
        state.guilds = [guild]
      }
    },
  })
  .get({
    action: "fetchGuilds",
    path: '/guilds',
    property: "guilds",
    queryParams: true,
    beforeRequest: (state, actionParams) => {
      const userId = MyVapi.store.getters["member/getUserId"]
      if (userId) {
        actionParams.params = {
          select: '*,game_play(*),guild_membership(*)',
          'guild_membership.member_id': `eq.${userId}`
        }
      } else {
        actionParams.params = {
          select: '*,game_play(*)'
        }
      }
    },
  })
  // Step 4
  .getStore({
    getters: {
      getGuildByStatus: (state) => (status) =>
        state.guilds.filter(guild => guild.status == status),
      getGuildById: (state) => (id) =>
        state.guilds.find(guild => guild.id == id),
      getGuilds: (state) =>
        state.guilds,
      getCurrentGuild: (state) =>
        state.guilds.find(g => g.id == state.currentGuild),
      getMyGuilds: (state) =>
        state.guilds.filter(guild => guild?.guild_membership?.find(m => m.member_id == MyVapi.store.getters["member/getUserId"])),
      isGuildMember: (state) => (guild_id) =>
        state.guilds.find(guild => guild.id == guild_id)?.guild_membership?.find(m => m.member_id == MyVapi.store.getters["member/getUserId"]),
    },
    actions: {
      setCurrentGuild: (context, guild) => {
        context.commit('SET_CURRENT_GUILD', guild);
      }
    },
    mutations: {
      SET_CURRENT_GUILD: (state, guild) => {
        state.currentGuild = guild;
      }
    },
  })

export default guilds;
