import MyVapi from "./base";
import { Guild, GuildMembership, GamePlay, Quest } from "../types";
import { registration_status_enum, permission_enum } from "../enums";
interface GuildMap {
  [key: number]: Guild;
}

export interface GuildsState {
  guilds: GuildMap;
  currentGuild?: number;
  fullFetch: boolean;
  fullGuilds: { [key: number]: boolean };
}

export const guilds = new MyVapi<GuildsState>({
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
    beforeRequest: (state: GuildsState, { full, params }) => {
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
    onSuccess: (state: GuildsState, res, axios, actionParams) => {
      state.guilds = {
        ...state.guilds,
        ...Object.fromEntries(
          res.data.map((guild: Guild) => [guild.id, guild])
        ),
      };
      if (actionParams.full) {
        state.fullGuilds = {
          ...state.fullGuilds,
          ...Object.fromEntries(
            res.data.map((guild: Guild) => [guild.id, true])
          ),
        };
      }
    },
  })
  .get({
    action: "fetchGuilds",
    property: "guilds",
    path: "/guilds",
    queryParams: true,
    beforeRequest: (state: GuildsState, { params }) => {
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
    onSuccess: (state: GuildsState, res, axios, actionParams) => {
      const fullGuilds = Object.values(state.guilds).filter(
        (guild: Guild) => state.fullGuilds[guild.id]
      );
      const guilds = Object.fromEntries(
        res.data.map((guild: Guild) => [guild.id, guild])
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
    action: "createGuildBase",
    path: "/guilds",
    onSuccess: (state: GuildsState, res, axios, { data }) => {
      const guild = res.data[0];
      state.guilds = { ...state.guilds, [guild.id]: guild };
      state.fullGuilds = { ...state.fullGuilds, [guild.id]: undefined };
      // TODO: update memberships in member.
    },
  })
  .patch({
    action: "updateGuild",
    path: ({ id }) => `/guilds?id=eq.${id}`,
    beforeRequest: (state: GuildsState, { params, data }) => {
      params.id = data.id;
      Object.assign(data, {
        casting: undefined,
        guild_membership: undefined,
        game_play: undefined,
        updated_at: undefined,
      });
    },
    onSuccess: (state: GuildsState, res, axios, { data }) => {
      let guild = res.data[0];
      guild = Object.assign({}, state.guilds[guild.id], guild);
      state.guilds = { ...state.guilds, [guild.id]: guild };
    },
  })
  .post({
    action: "addGuildMembership",
    path: "/guild_membership",
    onSuccess: (state: GuildsState, res, axios, actionParams) => {
      const membership = res.data[0];
      const guild = state.guilds[membership.guild_id];
      if (guild) {
        const memberships = guild.guild_membership || [];
        memberships.push(membership);
        guild.guild_membership = memberships;
      }
      MyVapi.store.commit("member/ADD_GUILD_MEMBERSHIP", membership);
    },
  })
  .patch({
    action: "updateGuildMembership",
    path: "/guild_membership",
    onSuccess: (state: GuildsState, res, axios, actionParams) => {
      const membership = res.data[0];
      const guild = state.guilds[membership.guild_id];
      if (guild) {
        const memberships =
          guild.guild_membership?.filter(
            (gp: GuildMembership) => gp.guild_id !== membership.guild_id
          ) || [];
        memberships.push(membership);
        guild.guild_membership = memberships;
      }
      MyVapi.store.commit("member/ADD_GUILD_MEMBERSHIP", membership);
    },
  })
  .call({
    action: "registerAllMembers",
    path: "register_all_members",
    queryParams: true,
    // TODO: modify quests's castings appropriately. May need an appropriate mutation.
  })
  // Step 4
  .getVuexStore({
    getters: {
      getGuilds: (state: GuildsState) => Object.values(state.guilds),
      getGuildById: (state: GuildsState) => (id: number) => state.guilds[id],
      getCurrentGuild: (state: GuildsState) => state.guilds[state.currentGuild],
      getMyGuilds: (state: GuildsState) => {
        const memberId = MyVapi.store.getters["member/getUserId"];
        return Object.values(state.guilds).filter((guild: Guild) =>
          guild?.guild_membership?.find(
            (m: GuildMembership) =>
              m.member_id == memberId &&
              m.status == registration_status_enum.confirmed
          )
        );
      },
      isGuildMember: (state: GuildsState) => (guild_id: number) => {
        const memberId = MyVapi.store.getters["member/getUserId"];
        return state.guilds[guild_id]?.guild_membership?.find(
          (m: GuildMembership) =>
            m.member_id == memberId &&
            m.status == registration_status_enum.confirmed
        );
      },
      getGuildsPlayingQuest: (state: GuildsState) => (quest: Quest) => {
        const guildId = quest.game_play.map((gp: GamePlay) => gp.guild_id);
        return Object.values(state.guilds).filter((guild: Guild) =>
          guildId.includes(guild.id)
        );
      },
    },
    actions: {
      setCurrentGuild: (context, guild_id: number) => {
        context.commit("SET_CURRENT_GUILD", guild_id);
      },
      ensureGuild: async (
        context,
        { guild_id, full = true }: { guild_id: number; full?: boolean }
      ) => {
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
      createGuild: async (context, { data }) => {
        const res = await context.dispatch("createGuildBase", { data });
        // Refetch to get memberships.
        // TODO: maybe add representation to creation instead?
        const guild_id = res.data[0].id;
        await context.dispatch("fetchGuildById", { params: { id: guild_id } });
        // TODO: Get the membership from the guild
        await MyVapi.store.dispatch("member/fetchLoginUser");
      },
      ensureAllGuilds: async (context) => {
        if (context.state.guilds.length === 0 || !context.state.fullFetch) {
          await context.dispatch("fetchGuilds");
        }
      },
      ensureCurrentGuild: async (context, { guild_id, full = true }) => {
        await context.dispatch("ensureGuild", { guild_id, full });
        await context.dispatch("setCurrentGuild", guild_id);
      },
      ensureGuildsPlayingQuest: async (
        context,
        { quest_id, full }: { quest_id: number; full: boolean }
      ) => {
        await MyVapi.store.dispatch("quests/ensureQuest", {
          quest_id,
          full: true,
        });
        const quest = MyVapi.store.getters["quests/getQuestById"](quest_id);
        let guildId: number[] = quest.game_play.map(
          (gp: GamePlay) => gp.guild_id
        );
        if (full) {
          guildId = guildId.filter(
            (id: number) => !context.state.fullGuilds[id]
          );
        } else {
          guildId = guildId.filter((id: number) => !context.state.guilds[id]);
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
      SET_CURRENT_GUILD: (state: GuildsState, guild_id: number) => {
        state.currentGuild = guild_id;
      },
      CLEAR_STATE: (state: GuildsState) => {
        state.guilds = {};
        state.currentGuild = null;
        state.fullFetch = false;
        state.fullGuilds = {};
      },
      ADD_GAME_PLAY: (state: GuildsState, game_play: GamePlay) => {
        const guild_id = game_play.guild_id;
        const guild = state.guilds[guild_id];
        // Assuming it is definitely not there
        if (guild) {
          const game_plays =
            guild.game_play?.filter(
              (gp: GamePlay) => gp.quest_id !== game_play.quest_id
            ) || [];
          game_plays.push(game_play);
          guild.game_play = game_plays;
        }
      },
    },
  });
