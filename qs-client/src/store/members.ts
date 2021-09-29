import {
  MyVapi,
  RestParamActionType,
  RestDataActionType,
  RestEmptyActionType,
  RetypeActionTypes,
  RetypeGetterTypes,
} from "./base";
import {
  Member,
  GuildMembership,
  QuestMembership,
  Quest,
  Casting,
  Guild,
} from "../types";

interface MemberMap {
  [key: number]: Member;
}
export interface MembersState {
  members: MemberMap;
  fullFetch: boolean;
  questFetch?: number;
  guildFetch?: number;
}

const MembersGetters = {
  getMembers: (state: MembersState) =>
    Object.values(state.members).sort((a, b) => a.name.localeCompare(b.handle)),
  getMemberById: (state: MembersState) => (id: number) => state.members[id],
  getMemberByHandle: (state: MembersState) => (handle: string) =>
    Object.values(state.members).find(
      (member: Member) => member.handle == handle
    ),
  getMembersByHandle: (state: MembersState) =>
    Object.fromEntries(
      Object.values(state.members).map((member: Member) => [
        member.handle,
        member,
      ])
    ),
  getMemberHandles: (state: MembersState) =>
    Object.values(state.members)
      .map((member: Member) => member.handle)
      .sort(),
  getMembersOfGuild: (state: MembersState) => (guild: Guild) =>
    guild.guild_membership
      .map((gm: GuildMembership) => state.members[gm.member_id])
      .filter((member: Member) => member),
  getMembersOfQuest: (state: MembersState) => (quest: Quest) =>
    quest.quest_membership
      .map((qm: QuestMembership) => state.members[qm.member_id])
      .filter((member: Member) => member),
  getPlayersOfQuest: (state: MembersState) => (quest: Quest) =>
    quest.casting
      .map((c: Casting) => state.members[c.member_id])
      .filter((member: Member) => member),
};

const MembersActions = {
  ensureAllMembers: async (context) => {
    if (context.state.members.length === 0 || !context.state.fullFetch) {
      await context.dispatch("fetchMembers");
    }
  },
  ensureMemberById: async (context, id: number) => {
    if (!context.state.members[id]) {
      await context.dispatch("fetchMemberById", { params: { id } });
    }
  },
  ensureMembersOfGuild: async (context, guildId: number) => {
    await MyVapi.store.dispatch("guilds/ensureGuild", {
      guild_id: guildId,
      force: true,
    });
    const guild = MyVapi.store.getters["guilds/getGuildById"](guildId);
    let membersId: number[] = guild.guild_membership.map(
      (mp: GuildMembership) => mp.member_id
    );
    membersId = membersId.filter((id: number) => !context.state.members[id]);
    if (membersId.length > 0) {
      await context.dispatch("fetchMemberById", {
        params: { id: membersId },
      });
    }
  },
  ensurePlayersOfQuest: async (context, questId: number) => {
    await MyVapi.store.dispatch("quests/ensureQuest", {
      questId,
      full: true,
    });
    const quest = MyVapi.store.getters["quests/getQuestById"](questId);
    let membersId: number[] = quest.casting.map((mp: Casting) => mp.member_id);
    membersId.concat(
      quest.quest_membership.map((mp: QuestMembership) => mp.member_id)
    );
    membersId = [...new Set(membersId)];
    membersId = membersId.filter((id: number) => !context.state.members[id]);
    if (membersId.length > 0) {
      await context.dispatch("fetchMemberById", {
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
  },
})
  // Step 3
  .get({
    action: "fetchMemberById",
    path: "/members",
    queryParams: true,
    beforeRequest: (state: MembersState, { params }) => {
      if (Array.isArray(params.id)) {
        params.id = `in.(${params.id.join(",")})`;
      } else {
        params.id = `eq.${params.id}`;
      }
    },
    onSuccess: (state: MembersState, res, axios, actionParams) => {
      state.members = {
        ...state.members,
        ...Object.fromEntries(
          res.data.map((member: Member) => [member.id, member])
        ),
      };
    },
  })
  .get({
    path: "/members",
    property: "members",
    action: "fetchMembers",
    onSuccess: (state: MembersState, res, axios, actionParams) => {
      const members = Object.fromEntries(
        res.data.map((member: Member) => [member.id, member])
      );
      state.members = members;
      state.fullFetch = true;
    },
  })
  .patch({
    action: "updateMember",
    path: ({ id }) => `/members?id=eq.${id}`,
    property: "members",
    beforeRequest: (state: MembersState, { params, data }) => {
      params.id = data.id;
    },
    onSuccess: (state: MembersState, res, axios, { data }) => {
      const member = res.data[0];
      state.members = { ...state.members, [member.id]: member };
    },
  })
  // Step 4
  .getVuexStore({
    getters: MembersGetters,
    actions: MembersActions,
  });

type MembersRestActionTypes = {
  fetchMemberById: RestParamActionType<{ id: number | number[] }>;
  fetchMembers: RestEmptyActionType;
  updateMember: RestDataActionType<Partial<Member>>;
};

export type MembersActionTypes = RetypeActionTypes<typeof MembersActions> &
  MembersRestActionTypes;
export type MembersGetterTypes = RetypeGetterTypes<typeof MembersGetters>;
