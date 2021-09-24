import MyVapi from "./base";

const guilds = new MyVapi({
  state: {
    currentGuild: null,
    fullFetch: false,
    guilds: {},
    fullGuilds: {},
  },
})
  // Step 3
  .get({
    action: "fetchGuildById",
    path: "/guilds",
    queryParams: true,
    beforeRequest: (state, { full, params }) => {
      if (Array.isArray(params.id)) {
        params.id = `in.(${params.id.join(",")})`;
      } else {
        params.id = `eq.${params.id}`;
      }
      const userId = MyVapi.store.getters["member/getUserId"];
      if (userId) {
        params.select = "*,guild_membership(*),casting(*),game_play(*)";
        if (!full) {
          Object.assign(params, {
            "guild_membership.member_id": `eq.${userId}`,
            "casting.member_id": `eq.${userId}`,
          });
        }
      } else {
        params.select = "*,game_play(*)";
      }
    },
    onSuccess: (state, res, axios, actionParams) => {
      state.guilds = {
        ...state.guilds,
        ...Object.fromEntries(res.data.map((guild) => [guild.id, guild])),
      };
      if (actionParams.full) {
        state.fullGuilds = {
          ...state.fullGuilds,
          ...Object.fromEntries(res.data.map((guild) => [guild.id, true])),
        };
      }
    },
  })
  .get({
    action: "fetchGuilds",
    property: "guilds",
    path: "/guilds",
    queryParams: true,
    beforeRequest: (state, { params }) => {
      const userId = MyVapi.store.getters["member/getUserId"];
      if (userId) {
        Object.assign(params, {
          select: "*,guild_membership(*),casting(*),game_play(*)",
          "guild_membership.member_id": `eq.${userId}`,
          "casting.member_id": `eq.${userId}`,
        });
      } else {
        params.select = "*,game_play(*)";
      }
    },
    onSuccess: (state, res, axios, actionParams) => {
      const fullGuilds = Object.values(state.guilds).filter(
        (guild) => state.fullGuilds[guild.id]
      );
      const guilds = Object.fromEntries(
        res.data.map((guild) => [guild.id, guild])
      );
      for (const guild of fullGuilds) {
        if (guilds[guild.id]) {
          guilds[guild.id] = Object.assign(guilds[guild.id], {
            casting: guild.casting,
            guild_membership: guild.guild_membership,
          });
        }
      }
      state.guilds = guilds;
      state.fullFetch = true;
    },
  })
  .post({
    action: "createGuild",
    path: "/guilds",
    onSuccess: (state, res, axios, { data }) => {
      state.guilds = { ...state.guilds, [res.data.id]: res.data };
    },
  })
  .patch({
    action: "updateGuild",
    path: ({ id }) => `/guilds?id=eq.${id}`,
    beforeRequest: (state, { params, data }) => {
      params.id = data.id;
      Object.assign(data, {
        casting: undefined,
        guild_membership: undefined,
        game_play: undefined,
        updated_at: undefined,
      });
    },
    onSuccess: (state, res, axios, { data }) => {
      var guild = res.data[0];
      guild = Object.assign(state.guilds[id], guild);
      state.guilds = { ...state.guilds, [guild.id]: guild };
    },
  })
  .call({
    action: "registerAllMembers",
    path: "register_all_members",
    queryParams: true,
    // TODO: modify quests's castings appropriately. May need an appropriate mutation.
  })
  // Step 4
  .getStore({
    getters: {
      getGuildsByStatus: (state) => (status) =>
        Object.values(state.guilds).filter((guild) => guild.status == status),
      getGuilds: (state) => Object.values(state.guilds),
      getGuildById: (state) => (id) => state.guilds[id],
      getCurrentGuild: (state) => state.guilds[state.currentGuild],
      getMyGuilds: (state) =>
        Object.values(state.guilds).filter((guild) =>
          guild?.guild_membership?.find(
            (m) =>
              m.member_id == MyVapi.store.getters["member/getUserId"] &&
              m.confirmed
          )
        ),
      isGuildMember: (state) => (guild_id) =>
        state.guilds[guild_id]?.guild_membership?.find(
          (m) =>
            m.member_id == MyVapi.store.getters["member/getUserId"] &&
            m.confirmed
        ),
      getGuildsPlayingQuest: (state) => (quest) => {
        var guildId = quest.game_play.map((gp) => gp.guild_id);
        return Object.values(state.guilds).filter((guild) =>
          guildId.includes(guild.id)
        );
      },
    },
    actions: {
      setCurrentGuild: (context, guild_id) => {
        context.commit("SET_CURRENT_QUEST", guild_id);
      },
      ensureGuild: async (context, guild_id, full) => {
        if (
          context.getters.getGuildById(guild_id) === undefined ||
          (full && !context.state.fullGuilds[guild_id])
        ) {
          await context.dispatch("fetchGuildById", {
            full,
            params: { id: guild_id },
          });
        }
      },
      ensureAllGuilds: async (context) => {
        if (context.state.guilds.length === 0 || !context.state.fullFetch) {
          await context.dispatch("fetchGuilds");
        }
      },
      ensureCurrentGuild: async (context, guild_id) => {
        await context.dispatch("ensureGuild", guild_id);
        await context.dispatch("setCurrentGuild", guild_id);
      },
      ensureGuildsPlayingQuest: async (context, questId, full) => {
        await MyVapi.store.dispatch("quests/ensureQuest", questId, true);
        const quest = MyVapi.store.getters["quests/getQuestById"](questId);
        var guildId = quest.game_play.map((gp) => gp.guild_id);
        if (full) {
          guildId = guildId.filter((id) => !context.state.fullGuilds[id]);
        } else {
          guildId = guildId.filter((id) => !context.state.guilds[id]);
        }
        if (guildId.length > 0) {
          await context.dispatch("fetchGuilds", {
            full,
            params: { id: guildId },
          });
        }
      },
      clearState: (context) => {
        context.commit("CLEAR_STATE");
      },
    },
    mutations: {
      SET_CURRENT_QUEST: (state, guild_id) => {
        state.currentGuild = Number.parseInt(guild_id);
      },
      CLEAR_STATE: (state) => {
        state.guilds = {};
        state.currentGuild = null;
        state.fullFetch = false;
        state.fullGuilds = {};
      },
    },
  });

export default guilds;
