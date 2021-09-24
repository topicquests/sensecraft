import MyVapi from "./base";

const members = new MyVapi({
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
    beforeRequest: (state, { params }) => {
      if (Array.isArray(params.id)) {
        params.id = `in.(${params.id.join(",")})`;
      } else {
        params.id = `eq.${params.id}`;
      }
    },
    onSuccess: (state, res, axios, actionParams) => {
      state.members = {
        ...state.members,
        ...Object.fromEntries(res.data.map((member) => [member.id, member])),
      };
      if (actionParams.full) {
        state.fullmembers = {
          ...state.fullmembers,
          ...Object.fromEntries(res.data.map((member) => [member.id, true])),
        };
      }
    },
  })
  .get({
    path: "/members",
    property: "members",
    action: "fetchMembers",
    onSuccess: (state, res, axios, actionParams) => {
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
    beforeRequest: (state, { params, data }) => {
      params.id = data.id;
    },
    onSuccess: (state, res, axios, { data }) => {
      const member = res.data[0];
      state.members = { ...state.members, [member.id]: member };
    },
  })
  // Step 4
  .getStore({
    getters: {
      getMembers: (state) =>
        Object.values(state.members).sort((a, b) =>
          a.name.localeCompare(b.handle)
        ),
      getMemberById: (state) => (id) => state.members[id],
      getMemberByHandle: (state) => (handle) =>
        Object.values(state.members).find((member) => member.handle == handle),
      getMembersByHandle: (state) =>
        Map.of(
          Object.values(state.members).map((member) => [member.handle, member])
        ),
      getMemberHandles: (state) =>
        Object.values(state.members)
          .map((member) => member.handle)
          .sort(),
      getMembersOfGuild: (state) => (guild) => {
        var memberIds = guild.guild_membership.map((gm) => gm.member_id);
        return Object.values(state.members).filter((member) =>
          memberIds.includes(member.id)
        );
      },
      getMembersOfQuest: (state) => (quest) => {
        var memberIds = quest.quest_membership.map((qm) => qm.member_id);
        return Object.values(state.members).filter((member) =>
          memberIds.includes(member.id)
        );
      },
      getPlayersOfQuest: (state) => (quest) => {
        var memberIds = quest.casting.map((qm) => qm.member_id);
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
        await MyVapi.store.dispatch("guilds/ensureGuild", guildId, true);
        const guild = MyVapi.store.getters["guilds/getGuildById"](guildId);
        var membersId = guild.guild_membership.map((mp) => mp.member_id);
        membersId = membersId.filter((id) => !context.state.members[id]);
        if (membersId.length > 0) {
          await context.dispatch("fetchMembers", { id: membersId });
        }
      },
      ensurePlayersOfQuest: async (context, questId) => {
        await MyVapi.store.dispatch("quests/ensureQuest", questId, true);
        const quest = MyVapi.store.getters["quests/getQuestById"](questId);
        var membersId = quest.casting.map((mp) => mp.member_id);
        membersId.concat(quest.quest_membership.map((mp) => mp.member_id));
        membersId = [...new Set(membersId)];
        membersId = membersId.filter((id) => !context.state.members[id]);
        if (membersId.length > 0) {
          await context.dispatch("fetchMembers", { params: { id: membersId } });
        }
      },
    },
  });

export default members;
