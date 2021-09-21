import MyVapi from "./base"

const guilds = new MyVapi({
  state: {
    singleFetch: true,
    currentGuild: null,
    guilds: []
  },
})
  // Step 3
  .get({
    action: "fetchGuildById",
    path: '/guilds',
    queryParams: true,
    beforeRequest: (state, actionParams) => {
      const { params } = actionParams
      params.id = `eq.${params.id}`
      const userId = MyVapi.store.getters["member/getUserId"]
      if (userId) {
        actionParams.params = Object.assign(params, {
          select: '*,game_play(*),guild_membership(*)',
          'guild_membership.member_id': `eq.${userId}`
        })
      } else {
        actionParams.params = Object.assign(params, {
          select: '*,game_play(*)'
        })
      }
    },
    onSuccess: (state, res, axios, actionParams) => {
      const guild = res.data[0]
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
  .post({
    action: "createGuild",
    path: '/guilds',
    onSuccess: (state, res, axios, { data }) => {
      state.guilds = [...state.guilds, res.data]
    }
  })
  .patch({
    action: "updateGuild",
    path: ({id}) => `/guilds?id=eq.${id}`,
    beforeRequest: (state, { params, data }) => {
      Object.assign(data, {casting: undefined, guild_membership: undefined, game_play: undefined, updated_at: undefined})
      params.id = data.id
    },
    onSuccess: (state, res, axios, { data }) => {
      const guild = res.data[0]
      const guilds = state.guilds.filter(q => q.id !== guild.id)
      guilds.push(guild)
      state.guilds = guilds
    }
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
        state.guilds.filter(guild => guild?.guild_membership?.find(m => m.member_id == MyVapi.store.getters["member/getUserId"] && m.status == 'confirmed')),
      isGuildMember: (state) => (guild_id) =>
        state.guilds.find(guild => guild.id == guild_id)?.guild_membership?.find(m => m.member_id == MyVapi.store.getters["member/getUserId"] && m.status == 'confirmed'),
    },
    actions: {
      setCurrentGuild: (context, guild) => {
        context.commit('SET_CURRENT_GUILD', guild);
      },
      ensureGuild: async (context, guild_id) => {
        if (context.getters.getGuildById(guild_id) === undefined) {
          await context.dispatch('fetchGuildById', { params: { id: guild_id } });
        }
      },
      ensureAllGuilds: async (context) => {
        if (context.state.guilds.length === 0 || context.state.singleFetch) {
          await context.dispatch('fetchGuilds');
        }
      },
      ensureCurrentGuild: async (context, guild_id) => {
        await context.dispatch('ensureGuild', guild_id);
        await context.dispatch('setCurrentGuild', guild_id);
      },
      clearState: (context) => {
        context.commit('CLEAR_STATE');
      },
    },
    mutations: {
      SET_CURRENT_GUILD: (state, guild) => {
        state.currentGuild = guild;
      },
      CLEAR_STATE: (state) => {
        state.guilds = [];
        state.currentGuild = null;
        state.singleFetch = true;
      },
    },
  })

export default guilds;
