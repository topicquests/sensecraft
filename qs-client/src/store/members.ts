import MyVapi from "./base";
import { Store as VuexStore } from "vuex";

export interface GuildMembership {
  guild_id: number;
  member_id: number;
  permissions: string[];
  available_roles?: string[];
  status: string;
  created_at: string;
  updated_at: string;
}
export interface QuestMembership {
  quest_id: number;
  member_id: number;
  permissions: string[];
  status: string;
  created_at: string;
  updated_at: string;
}
export interface Casting {
  guild_id: number;
  quest_id: number;
  member_id: number;
  permissions: string[];
  roles?: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: number;
  email: string;
  password: string;
  handle: string;
  created_at: string;
  updated_at: string;
  name: string;
  permissions: string[];
  guild_membership?: GuildMembership[];
  quest_membership?: QuestMembership[];
  casting?: Casting[];
}

interface MemberMap {
  [key: number]: Member;
}
interface MembersState {
  members: MemberMap;
  fullFetch: boolean;
  questFetch?: number;
  guildFetch?: number;
}

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
        ...Object.fromEntries(res.data.map((member) => [member.id, member])),
      };
    },
  })
  .get({
    path: "/members",
    property: "members",
    action: "fetchMembers",
    onSuccess: (state: MembersState, res, axios, actionParams) => {
      const members = Object.fromEntries(
        res.data.map((member) => [member.id, member])
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
    getters: {
      getMembers: (state: MembersState) =>
        Object.values(state.members).sort((a, b) =>
          a.name.localeCompare(b.handle)
        ),
      getMemberById: (state: MembersState) => (id) => state.members[id],
      getMemberByHandle: (state: MembersState) => (handle) =>
        Object.values(state.members).find((member) => member.handle == handle),
      getMembersByHandle: (state: MembersState) =>
        Object.fromEntries(
          Object.values(state.members).map((member) => [member.handle, member])
        ),
      getMemberHandles: (state: MembersState) =>
        Object.values(state.members)
          .map((member) => member.handle)
          .sort(),
      getMembersOfGuild: (state: MembersState) => (guild) => {
        const memberIds = guild.guild_membership.map((gm) => gm.member_id);
        return Object.values(state.members).filter((member) =>
          memberIds.includes(member.id)
        );
      },
      getMembersOfQuest: (state: MembersState) => (quest) => {
        const memberIds = quest.quest_membership.map((qm) => qm.member_id);
        return Object.values(state.members).filter((member) =>
          memberIds.includes(member.id)
        );
      },
      getPlayersOfQuest: (state: MembersState) => (quest) => {
        const memberIds = quest.casting.map((qm) => qm.member_id);
        return Object.values(state.members).filter((member) =>
          memberIds.includes(member.id)
        );
      },
    },
    actions: {
      ensureAllMembers: async (context) => {
        if (context.state.members.length === 0 || !context.state.fullFetch) {
          await context.dispatch("fetchMembers");
        }
      },
      ensureMembersOfGuild: async (context, guildId) => {
        await MyVapi.store.dispatch("guilds/ensureGuild", {
          guild_id: guildId,
          force: true,
        });
        const guild = MyVapi.store.getters["guilds/getGuildById"](guildId);
        let membersId = guild.guild_membership.map((mp) => mp.member_id);
        membersId = membersId.filter((id) => !context.state.members[id]);
        if (membersId.length > 0) {
          await context.dispatch("fetchMembers", { id: membersId });
        }
      },
      ensurePlayersOfQuest: async (context, questId) => {
        await MyVapi.store.dispatch("quests/ensureQuest", {
          questId,
          full: true,
        });
        const quest = MyVapi.store.getters["quests/getQuestById"](questId);
        let membersId = quest.casting.map((mp) => mp.member_id);
        membersId.concat(quest.quest_membership.map((mp) => mp.member_id));
        membersId = [...new Set(membersId)];
        membersId = membersId.filter((id) => !context.state.members[id]);
        if (membersId.length > 0) {
          await context.dispatch("fetchMembers", { params: { id: membersId } });
        }
      },
    },
  });
