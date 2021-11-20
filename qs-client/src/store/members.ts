import {
  MyVapi,
  RestParamActionType,
  RestDataActionType,
  RestEmptyActionType,
  RetypeActionTypes,
  RetypeGetterTypes,
} from "./base";
import { AxiosResponse, AxiosInstance } from "axios";
import {
  PublicMember,
  GuildMembership,
  QuestMembership,
  Quest,
  Casting,
  Guild,
  GuildMemberAvailableRole,
} from "../types";
import { MemberState } from "./member";

interface MemberMap {
  [key: number]: PublicMember;
}
export interface MembersState {
  members: MemberMap;
  fullFetch: boolean;
  questFetch?: number;
  guildFetch?: number;
  fullMembers: { [key: number]: boolean };
}

const MembersGetters = {
  getMembers: (state: MembersState) =>
    Object.values(state.members).sort((a, b) =>
      a.handle.localeCompare(b.handle)
    ),
  getMemberById: (state: MembersState) => (id: number) => state.members[id],
  getMemberByHandle: (state: MembersState) => (handle: string) =>
    Object.values(state.members).find(
      (member: PublicMember) => member.handle == handle
    ),
  getMembersByHandle: (state: MembersState) =>
    Object.fromEntries(
      Object.values(state.members).map((member: PublicMember) => [
        member.handle,
        member,
      ])
    ),
  getMemberHandles: (state: MembersState) =>
    Object.values(state.members)
      .map((member: PublicMember) => member.handle)
      .sort(),
  getMembersOfGuild: (state: MembersState) => (guild: Guild) =>
    guild.guild_membership
      .map((gm: GuildMembership) => state.members[gm.member_id])
      .filter((member: PublicMember) => member),
  getMembersOfQuest: (state: MembersState) => (quest: Quest) =>
    quest.quest_membership
      .map((qm: QuestMembership) => state.members[qm.member_id])
      .filter((member: PublicMember) => member),
  getPlayersOfQuest: (state: MembersState) => (quest: Quest) =>
    quest.casting
      .map((c: Casting) => state.members[c.member_id])
      .filter((member: PublicMember) => member),
  getPlayersRoles: (state: MembersState) => (member_id: number) => {
    return state.members[member_id]?.casting_role;
  },
};

const MembersActions = {
  ensureAllMembers: async (context) => {
    if (context.state.members.length === 0 || !context.state.fullFetch) {
      await context.dispatch("fetchMembers");
    }
  },
  ensureMemberById: async (
    context,
    { id, full = true }: { id: number; full?: boolean }
  ) => {
    if (!context.state.members[id]) {
      await context.dispatch("fetchMemberById", { full, params: { id } });
    }
  },
  ensureMembersOfGuild: async (
    context,
    { guildId, full = true }: { guildId: number; full?: boolean }
  ) => {
    await MyVapi.store.dispatch("guilds/ensureGuild", {
      guild_id: guildId,
      force: true,
    });
    const guild = MyVapi.store.getters["guilds/getGuildById"](guildId);
    let membersId: number[] =
      guild.guild_membership?.map((mp: GuildMembership) => mp.member_id) || [];
    membersId = membersId.filter((id: number) => !context.state.members[id]);
    if (membersId.length > 0) {
      await context.dispatch("fetchMemberById", {
        full,
        params: { id: membersId },
      });
    }
  },
  ensurePlayersOfQuest: async (
    context,
    { questId, full = true }: { questId: number; full?: boolean }
  ) => {
    await MyVapi.store.dispatch("quests/ensureQuest", {
      questId,
      full: true,
    });
    const quest = MyVapi.store.getters["quests/getQuestById"](questId);
    let membersId: number[] =
      quest.casting?.map((mp: Casting) => mp.member_id) || [];
    membersId.concat(
      quest.quest_membership?.map((mp: QuestMembership) => mp.member_id) || []
    );
    membersId = [...new Set(membersId)];
    membersId = membersId.filter((id: number) => !context.state.members[id]);
    if (membersId.length > 0) {
      await context.dispatch("fetchMemberById", {
        full,
        params: { id: membersId },
      });
    }
  },
};

export const members = new MyVapi<MembersState>({
  state: {
    fullFetch: false,
    questFetch: null,
    guildFetch: null,
    members: {},
    fullMembers: {},
  } as MembersState,
})
  // Step 3
  .get({
    action: "fetchMemberById",
    path: "/public_members",
    queryParams: true,
    beforeRequest: (state: MembersState, { full, params }) => {
      if (Array.isArray(params.id)) {
        params.id = `in.(${params.id.join(",")})`;
      } else {
        params.id = `eq.${params.id}`;
      }
      if (full) {
        Object.assign(params, {
          select:
            "*,guild_member_available_role!member_id(*),casting_role!member_id(*)",
        });
      }
    },
    onSuccess: (
      state: MembersState,
      res: AxiosResponse<PublicMember[]>,
      axios: AxiosInstance,
      actionParams
    ) => {
      state.members = {
        ...state.members,
        ...Object.fromEntries(
          res.data.map((member: PublicMember) => [member.id, member])
        ),
      };
      if (actionParams.full) {
        state.fullMembers = {
          ...state.fullMembers,
          ...Object.fromEntries(
            res.data.map((member: PublicMember) => [member.id, true])
          ),
        };
      }
    },
  })
  .get({
    path: "/public_members",
    property: "members",
    action: "fetchMembers",
    onSuccess: (
      state: MembersState,
      res: AxiosResponse<PublicMember[]>,
      axios: AxiosInstance,
      actionParams
    ) => {
      const fullMembers = Object.values(state.members).filter(
        (member: PublicMember) => state.fullMembers[member.id]
      );
      const members = Object.fromEntries(
        res.data.map((member: PublicMember) => [member.id, member])
      );
      for (const member of fullMembers) {
        if (members[member.id]) {
          Object.assign(members[member.id], {
            guild_member_available_role: member.guild_member_available_role,
            casting_role: member.casting_role,
          });
        }
      }
      state.members = members;
      state.fullFetch = true;
    },
  })
  .patch({
    action: "updateMember",
    path: ({ id }) => `/public_members?id=eq.${id}`,
    property: "members",
    beforeRequest: (state: MembersState, { params, data }) => {
      params.id = data.id;
      data.slug = undefined;
    },
    onSuccess: (
      state: MembersState,
      res: AxiosResponse<PublicMember[]>,
      axios: AxiosInstance,
      { data }
    ) => {
      const member = res.data[0];
      state.members = { ...state.members, [member.id]: member };
    },
  })
  // Step 4
  .getVuexStore({
    getters: MembersGetters,
    actions: MembersActions,
    mutations: {
      ADD_GUILD_MEMBER_AVAILABLE_ROLE: (
        state: MembersState,
        guild_Member_Available_Role: GuildMemberAvailableRole
      ) => {
        const member_id = guild_Member_Available_Role.member_id;
        let member = state.members[member_id];
        if (member) {
          const guildMemberAvailableRoles =
            member.guild_member_available_role.filter(
              (a: GuildMemberAvailableRole) =>
                a.role_id != guild_Member_Available_Role.role_id
            ) || [];
          guildMemberAvailableRoles.push(guild_Member_Available_Role);
          member.guild_member_available_role = guildMemberAvailableRoles;
          member = { ...member };
          state.members = { [member_id]: member, ...state.members };
        }
      },
    },
  });

type MembersRestActionTypes = {
  fetchMemberById: ({
    full,
    params,
  }: {
    full?: boolean;
    params: { id: number | number[] };
  }) => Promise<AxiosResponse<PublicMember[]>>;
  fetchMembers: RestEmptyActionType<PublicMember[]>;
  updateMember: RestDataActionType<Partial<PublicMember>, PublicMember[]>;
};

export type MembersActionTypes = RetypeActionTypes<typeof MembersActions> &
  MembersRestActionTypes;
export type MembersGetterTypes = RetypeGetterTypes<typeof MembersGetters>;
