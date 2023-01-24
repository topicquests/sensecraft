import {
  MyVapi,
  RestParamActionType,
  RestDataActionType,
  RestEmptyActionType,
  RetypeActionTypes,
  RetypeGetterTypes,
  filterKeys,
} from "./base";
import {
  Guild,
  GuildData,
  GuildMembership,
  GamePlay,
  Quest,
  GuildMemberAvailableRole,
  guildPatchKeys,
  PublicMember,
} from "../types";
import { registration_status_enum, game_play_status_enum } from "../enums";
import { AxiosResponse, AxiosInstance } from "axios";
import { getWSClient } from "../wsclient";

interface GuildMap {
  [key: number]: GuildData;
}

export interface GuildsState {
  guilds: GuildMap;
  currentGuild?: number;
  fullFetch: boolean;
  fullGuilds: { [key: number]: boolean };
}

const GuildsGetters = {
  getGuilds: (state: GuildsState) => Object.values(state.guilds),
  getGuildById: (state: GuildsState) => (id: number) => state.guilds[id],
  getCurrentGuild: (state: GuildsState) => state.guilds[state.currentGuild],
  getMyGuilds: (state: GuildsState) => {
    const memberId = MyVapi.store.getters["member/getUserId"];
    return Object.values(state.guilds).filter((guild: GuildData) =>
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
  getGuildsPlayingCurrentQuest: (state: GuildsState) => {
    const quest: Quest = MyVapi.store.getters["quests/getCurrentQuest"];
    if (!quest) return [];
    const guildId = quest.game_play?.map((gp: GamePlay) =>
      gp.game_status != game_play_status_enum.cancelled ? gp.guild_id : null
    );
    if (guildId == undefined) return [];
    return Object.values(state.guilds).filter((guild: GuildData) =>
      guildId.includes(guild.id)
    );
  },
  getGuildMembershipById: (state: GuildsState) => (member_id: number) => {
    const guildId: number = state.currentGuild;
    return state.guilds[guildId]?.guild_membership?.find(
      (m: GuildMembership) => m.member_id == member_id && m.guild_id == guildId
    );
  },
  getMembersOfCurrentGuild: (state: GuildsState) => {
    const guild = state.guilds[state.currentGuild];
    const members = MyVapi.store.state["members"]["members"];
    return guild?.guild_membership
      ?.map((gm: GuildMembership) => members[gm.member_id])
      .filter((member: PublicMember) => member);
  },
};

const GuildsActions = {
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
    await context.dispatch("addGuildMemberAvailableRole", {
      data: {
        member_id: res.data[0].creator,
        guild_id: guild_id,
        role_id: res.data[0].default_role_id,
      },
    });
    return res.data[0];
  },
  ensureAllGuilds: async (context) => {
    if (context.state.guilds.length === 0 || !context.state.fullFetch) {
      await context.dispatch("fetchGuilds");
    }
  },
  ensureCurrentGuild: async (context, { guild_id, full = true }: {guild_id: number, full: boolean}) => {
    await context.dispatch("ensureGuild", { guild_id, full });
    await context.dispatch("setCurrentGuild", guild_id);
  },
  ensureGuildsPlayingQuest: async (
    context,
    { quest_id, full }: { quest_id: number; full?: boolean }
  ) => {
    await MyVapi.store.dispatch("quests/ensureQuest", {
      quest_id,
      full: true,
    });
    const quest = MyVapi.store.getters["quests/getQuestById"](quest_id);
    let guildId: number[] = quest.game_play?.map((gp: GamePlay) => gp.guild_id);
    if (guildId == undefined) return [];
    if (full) {
      guildId = guildId.filter((id: number) => !context.state.fullGuilds[id]);
    } else {
      guildId = guildId.filter((id: number) => !context.state.guilds[id]);
    }
    if (guildId.length > 0) {
      const guildParam = guildId.length == 1 ? guildId[0] : guildId;
      await context.dispatch("fetchGuilds", {
        full,
        params: { id: guildParam },
      });
    }
  },
  addGuildMembership: async (context, membership: Partial<GuildMembership>) => {
    await context.dispatch("doAddGuildMembership", { data: membership });
    const gMembership: GuildMembership = context.state.guilds[
      membership.guild_id
    ].guild_membership.find(
      (c: GuildMembership) => c.member_id == membership.member_id
    );
    if (gMembership.status == "confirmed") {
      await MyVapi.store.dispatch("members/fetchMemberById", { full: true, params: { id: membership.member_id } });
      if (membership.member_id == MyVapi.store.getters["member/getUserId"]) {
        await MyVapi.store.dispatch("member/fetchLoginUser");
      }
    }
  },
  updateGuildMembership: async (
    context,
    membership: Partial<GuildMembership>
  ) => {
    await context.dispatch("doUpdateGuildMembership", { data: membership });
    const gMembership: GuildMembership = context.state.guilds[
      membership.guild_id
    ].guild_membership.find(
      (c: GuildMembership) => c.member_id == membership.member_id
    );
    if (gMembership.status == "confirmed") {
      await MyVapi.store.dispatch("members/reloadIfFull", membership.member_id);
      if (membership.member_id == MyVapi.store.getters["member/getUserId"]) {
        await MyVapi.store.dispatch("member/fetchLoginUser");
      }
    }
  },
  resetGuilds: (context) => {
    context.commit("CLEAR_STATE");
  },
};

const baseState: GuildsState = {
  currentGuild: null,
  fullFetch: false,
  guilds: {},
  fullGuilds: {},
};

export const guilds = (axios: AxiosInstance) =>
  new MyVapi<GuildsState>({
    axios,
    state: baseState,
  })
    // Step 3
    .get({
      action: "fetchGuildById",
      path: "/guilds_data",
      queryParams: true,
      beforeRequest: (state: GuildsState, { full, params }) => {
        if (Array.isArray(params.id)) {
          params.id = `in.(${params.id.join(",")})`;
        } else {
          params.id = `eq.${params.id}`;
        }
        const userId = MyVapi.store.getters["member/getUserId"];
        if (userId) {
          params.select =
            "*,guild_membership!guild_id(*),casting!guild_id(*),game_play!guild_id(*)";
          if (!full) {
            Object.assign(params, {
              "guild_membership.member_id": `eq.${userId}`,
              "casting.member_id": `eq.${userId}`,
            });
          }
        } else {
          params.select = "*,game_play!guild_id(*)";
        }
      },
      onSuccess: (
        state: GuildsState,
        res: AxiosResponse<GuildData[]>,
        axios: AxiosInstance,
        actionParams
      ) => {
        state.guilds = {
          ...state.guilds,
          ...Object.fromEntries(
            res.data.map((guild: GuildData) => [guild.id, guild])
          ),
        };
        if (actionParams.full) {
          state.fullGuilds = {
            ...state.fullGuilds,
            ...Object.fromEntries(
              res.data.map((guild: GuildData) => [guild.id, true])
            ),
          };
        }
      },
    })
    .get({
      action: "fetchGuilds",
      property: "guilds",
      path: "/guilds_data",
      queryParams: true,
      beforeRequest: (state: GuildsState, { params }) => {
        if (params.id) {
          if (Array.isArray(params.id)) {
            params.id = `in.(${params.id.join(",")})`;
          } else {
            params.id = `eq.${params.id}`;
          }
        }
        const userId = MyVapi.store.getters["member/getUserId"];
        if (userId) {
          Object.assign(params, {
            select:
              "*,guild_membership!guild_id(*),casting!guild_id(*),game_play!guild_id(*)",
            "guild_membership.member_id": `eq.${userId}`,
            "casting.member_id": `eq.${userId}`,
          });
        } else {
          params.select = "*,game_play!guild_id(*)";
        }
      },
      onSuccess: (
        state: GuildsState,
        res: AxiosResponse<GuildData[]>,
        axios: AxiosInstance,
        actionParams
      ) => {
        const fullGuilds = Object.values(state.guilds).filter(
          (guild: GuildData) => state.fullGuilds[guild.id]
        );
        const guilds = Object.fromEntries(
          res.data.map((guild: GuildData) => [guild.id, guild])
        );
        for (const guild of fullGuilds) {
          if (guilds[guild.id]) {
            guilds[guild.id] = Object.assign(guilds[guild.id], {
              casting: guild.casting,
              guild_membership: guild.guild_membership,
            });
          } else {
            guilds[guild.id] = guild;
          }
        }
        state.guilds = guilds;
        state.fullFetch = true;
      },
    })
    .post({
      action: "createGuildBase",
      path: "/guilds",
      onSuccess: (
        state: GuildsState,
        res: AxiosResponse<Guild[]>,
        axios: AxiosInstance,
        { data }
      ) => {
        const guildData: GuildData = Object.assign(res.data[0], {
          member_count: 1,
          member_request_count: 0,
          is_member: true,
          is_admin: true,
          last_node_published_at: null,
          node_count: 0,
          ongoing_quests_count: 0,
          finished_quests_count: 0,
          recruiting_for_quest_count: 0,
        });
        state.guilds = { ...state.guilds, [guildData.id]: guildData };
        state.fullGuilds = { ...state.fullGuilds, [guildData.id]: undefined };
        // TODO: update memberships in member.
      },
    })
    .patch({
      action: "updateGuild",
      path: ({ id }) => `/guilds?id=eq.${id}`,
      beforeRequest: (state: GuildsState, actionParams) => {
        const { params, data } = actionParams;
        params.id = data.id;
        actionParams.data = filterKeys(data, guildPatchKeys);
      },
      onSuccess: (
        state: GuildsState,
        res: AxiosResponse<Guild[]>,
        axios: AxiosInstance,
        { data }
      ) => {
        const guild = res.data[0];
        const guildData: GuildData = Object.assign(
          state.guilds[guild.id],
          guild
        );
        state.guilds = { ...state.guilds, [guild.id]: guildData };
      },
    })
    .post({
      action: "doAddGuildMembership",
      path: "/guild_membership",
      onSuccess: (
        state: GuildsState,
        res: AxiosResponse<GuildMembership[]>,
        axios: AxiosInstance,
        actionParams
      ) => {
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
      action: "doUpdateGuildMembership",
      path: ({ member_id, guild_id }) =>
        `/guild_membership?member_id=eq.${member_id}&guild_id=eq.${guild_id}`,
      beforeRequest: (state: GuildsState, { params, data }) => {
        params.member_id = data.member_id;
        params.guild_id = data.guild_id;
      },
      onSuccess: (
        state: GuildsState,
        res: AxiosResponse<GuildMembership[]>,
        axios: AxiosInstance,
        actionParams
      ) => {
        const membership = res.data[0];
        const guild = state.guilds[membership.guild_id];
        if (guild) {
          const memberships =
            guild.guild_membership?.filter(
              (gp: GuildMembership) => gp.member_id !== membership.member_id
            ) || [];
          memberships.push(membership);
          guild.guild_membership = memberships;
        }
        MyVapi.store.commit("member/ADD_GUILD_MEMBERSHIP", membership);
      },
    })
    .post({
      action: "addGuildMemberAvailableRole",
      path: "/guild_member_available_role",
      onSuccess: (
        state: GuildsState,
        res: AxiosResponse<GuildMemberAvailableRole[]>,
        axios: AxiosInstance,
        actionParams
      ) => {
        const availableRole = res.data[0];
        if (
          MyVapi.store.getters["member/getUserId"] == availableRole.member_id
        ) {
          MyVapi.store.commit(
            "member/ADD_GUILD_MEMBER_AVAILABLE_ROLE",
            availableRole
          );
        }
        MyVapi.store.commit(
          "members/ADD_GUILD_MEMBER_AVAILABLE_ROLE",
          availableRole
        );
      },
    })
    .patch({
      action: "updateGuildMemberAvailable",
      path: "/guild_member_available_role",
    })
    .delete({
      action: "deleteGuildMemberAvailableRole",
      path: ({ member_id, guild_id, role_id }) =>
        `/guild_member_available_role?member_id=eq.${member_id}&guild_id=eq.${guild_id}&role_id=eq.${role_id}`,
      onSuccess: (
        state: GuildsState,
        res: AxiosResponse<GuildMemberAvailableRole[]>,
        axios: AxiosInstance,
        actionParams
      ) => {
        const availableRole = res.data[0];
        if (
          MyVapi.store.getters["member/getUserId"] == availableRole.member_id
        ) {
          MyVapi.store.commit(
            "member/REMOVE_GUILD_MEMBER_AVAILABLE_ROLE",
            availableRole
          );
        }
        MyVapi.store.commit(
          "members/REMOVE_GUILD_MEMBER_AVAILABLE_ROLE",
          availableRole
        );
        const castingRoles = MyVapi.store.getters["quests/getCastingRolesById"](
          { member_id: availableRole.member_id, role_id: availableRole.role_id }
        );
        if (castingRoles?.length) {
          castingRoles.array.forEach((element) => {
            MyVapi.store.dispatch("quests/deleteCastingRole", element);
          });
        }
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
      getters: GuildsGetters,
      actions: GuildsActions,
      mutations: {
        SET_CURRENT_GUILD: (state: GuildsState, guild_id: number) => {
          state.currentGuild = guild_id;
          getWSClient().setDefaultGuild(guild_id);
        },
        CLEAR_STATE: (state: GuildsState) => {
          Object.assign(state, baseState);
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

type GuildsRestActionTypes = {
  fetchGuildById: ({
    full,
    params,
  }: {
    full?: boolean;
    params: { id: number | number[] };
  }) => Promise<AxiosResponse<GuildData[]>>;
  fetchGuilds: RestEmptyActionType<GuildData[]>;
  createGuildBase: RestDataActionType<Partial<Guild>, Guild[]>;
  updateGuild: RestDataActionType<Partial<Guild>, Guild[]>;
  doAddGuildMembership: RestDataActionType<
    Partial<GuildMembership>,
    GuildMembership[]
  >;
  doUpdateGuildMembership: RestDataActionType<
    Partial<GuildMembership>,
    GuildMembership[]
  >;
  addGuildMemberAvailableRole: RestDataActionType<
    Partial<GuildMemberAvailableRole>,
    GuildMemberAvailableRole[]
  >;
  updateGuildMemberAvailableRole: RestDataActionType<
    Partial<GuildMemberAvailableRole>,
    GuildMemberAvailableRole[]
  >;
  deleteGuildMemberAvailableRole: RestParamActionType<
    Partial<GuildMemberAvailableRole>,
    GuildMemberAvailableRole[]
  >;
  registerAllMembers: RestParamActionType<
    { questId: number; guildId: number },
    void
  >;
};

export type GuildsActionTypes = RetypeActionTypes<typeof GuildsActions> &
  GuildsRestActionTypes;
export type GuildsGetterTypes = RetypeGetterTypes<typeof GuildsGetters>;
