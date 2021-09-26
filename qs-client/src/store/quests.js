import MyVapi from "./base";

const quests = new MyVapi({
  state: {
    currentQuest: null,
    fullFetch: false,
    quests: {},
    fullQuests: {},
  },
})
  // Step 3
  .get({
    action: "fetchQuestById",
    path: "/quests",
    queryParams: true,
    beforeRequest: (state, { full, params }) => {
      if (Array.isArray(params.id)) {
        params.id = `in.(${params.id.join(",")})`;
      } else {
        params.id = `eq.${params.id}`;
      }
      const userId = MyVapi.store.getters["member/getUserId"];
      if (userId) {
        params.select = "*,quest_membership(*),casting(*),game_play(*)";
        if (!full) {
          Object.assign(params, {
            "quest_membership.member_id": `eq.${userId}`,
            "casting.member_id": `eq.${userId}`,
          });
        }
      } else {
        params.select = "*,game_play(*)";
      }
    },
    onSuccess: (state, res, axios, actionParams) => {
      state.quests = {
        ...state.quests,
        ...Object.fromEntries(res.data.map((quest) => [quest.id, quest])),
      };
      if (actionParams.full) {
        state.fullQuests = {
          ...state.fullQuests,
          ...Object.fromEntries(res.data.map((quest) => [quest.id, true])),
        };
      }
    },
  })
  .get({
    action: "fetchQuests",
    property: "quests",
    path: "/quests",
    queryParams: true,
    beforeRequest: (state, { params }) => {
      const userId = MyVapi.store.getters["member/getUserId"];
      if (userId) {
        Object.assign(params, {
          select: "*,quest_membership(*),casting(*),game_play(*)",
          "quest_membership.member_id": `eq.${userId}`,
          "casting.member_id": `eq.${userId}`,
        });
      } else {
        params.select = "*,game_play(*)";
      }
    },
    onSuccess: (state, res, axios, actionParams) => {
      const fullQuests = Object.values(state.quests).filter(
        (quest) => state.fullQuests[quest.id]
      );
      const quests = Object.fromEntries(
        res.data.map((quest) => [quest.id, quest])
      );
      for (const quest of fullQuests) {
        if (quests[quest.id]) {
          quests[quest.id] = Object.assign(quests[quest.id], {
            casting: quest.casting,
            quest_membership: quest.quest_membership,
          });
        }
      }
      state.quests = quests;
      state.fullFetch = true;
    },
  })
  .post({
    action: "createQuestBase",
    path: "/quests",
    onSuccess: (state, res, axios, { data }) => {
      const quest = res.data[0];
      state.quests = { ...state.quests, [quest.id]: quest };
    },
  })
  .patch({
    action: "updateQuest",
    path: ({ id }) => `/quests?id=eq.${id}`,
    beforeRequest: (state, { params, data }) => {
      params.id = data.id;
      Object.assign(data, {
        casting: undefined,
        quest_membership: undefined,
        game_play: undefined,
        updated_at: undefined,
      });
    },
    onSuccess: (state, res, axios, { data }) => {
      var quest = res.data[0];
      quest = Object.assign({}, state.quests[id], quest);
      state.quests = { ...state.quests, [quest.id]: quest };
      state.fullQuests = { ...state.fullQuests, [quest.id]: undefined };
    },
  })
  .post({
    action: "addMembership",
    path: "/quest_membership",
    onSuccess: (state, res, axios, actionParams) => {
      const membership = res.data[0];
      const quest = state.quests[membership.quest_id];
      if (quest) {
        const memberships = quest.membership || [];
        memberships.push(membership);
        quest.membership = memberships;
      }
      MyVapi.store.commit("member/ADD_QUEST_MEMBERSHIP", membership);
    },
  })
  .patch({
    action: "updateMembership",
    path: "/quest_membership",
    onSuccess: (state, res, axios, actionParams) => {
      const membership = res.data[0];
      const quest = state.quests[membership.quest_id];
      if (quest) {
        const memberships =
          quest.membership?.filter(
            (gp) => gp.quest_id !== membership.quest_id
          ) || [];
        memberships.push(membership);
        quest.membership = memberships;
      }
      MyVapi.store.commit("member/ADD_QUEST_MEMBERSHIP", membership);
    },
  })
  .post({
    action: "addGamePlay",
    path: "/game_play",
    onSuccess: (state, res, axios, actionParams) => {
      const game_play = res.data[0];
      const quest = state.quests[game_play.quest_id];
      if (quest) {
        const game_plays = quest.game_play || [];
        game_plays.push(game_play);
        quest.game_play = game_plays;
      }
      MyVapi.store.commit("guilds/ADD_GAME_PLAY", game_play);
    },
  })
  .patch({
    action: "updateGamePlay",
    path: "/game_play",
    onSuccess: (state, res, axios, actionParams) => {
      const game_play = res.data[0];
      const quest = state.quests[game_play.quest_id];
      if (quest) {
        const game_plays =
          quest.game_play?.filter((gp) => gp.quest_id !== game_play.quest_id) ||
          [];
        game_plays.push(game_play);
        quest.game_play = game_plays;
      }
      MyVapi.store.commit("guilds/ADD_GAME_PLAY", game_play);
    },
  })
  .post({
    action: "addCasting",
    path: "/casting",
    onSuccess: (state, res, axios, actionParams) => {
      const casting = res.data[0];
      console.log(res);
      const quest = state.quests[quest_id];
      if (quest) {
        if (quest.casting === undefined) quest.casting = [];
        quest.casting.push(casting);
      }
      const store = MyVapi.store;
      if ((casting.member_id = store.getters["member/getUserId"])) {
        store.commit("member/addCasting", casting);
      }
    },
  })
  // Step 4
  .getStore({
    getters: {
      getQuestsByStatus: (state) => (status) =>
        Object.values(state.quests).filter((quest) => quest.status == status),
      getQuests: (state) => Object.values(state.quests),
      getQuestById: (state) => (id) => state.quests[id],
      getCurrentQuest: (state) => state.quests[state.currentQuest],
      getMyQuests: (state) =>
        Object.values(state.quests).filter((quest) =>
          quest?.quest_membership?.find(
            (m) =>
              m.member_id == MyVapi.store.getters["member/getUserId"] &&
              m.status == "confirmed"
          )
        ),
      getPlayingQuests: (state) =>
        Object.values(state.quests).filter((quest) =>
          quest.casting?.find(
            (c) => c.member_id == MyVapi.store.getters["member/getUserId"]
          )
        ),
      isQuestMember: (state) => (quest_id) =>
        state.quests[quest_id]?.quest_membership?.find(
          (m) =>
            m.member_id == MyVapi.store.getters["member/getUserId"] &&
            m.status == "confirmed"
        ),
      castingInQuest: (state) => (quest_id) =>
        state.quests[quest_id]?.casting?.find(
          (c) => c.member_id == MyVapi.store.getters["member/getUserId"]
        ),
    },
    actions: {
      setCurrentQuest: (context, quest_id) => {
        context.commit("SET_CURRENT_QUEST", quest_id);
      },
      ensureQuest: async (context, quest_id, full = true) => {
        if (
          context.getters.getQuestById(quest_id) === undefined ||
          (full && !context.state.fullQuests[quest_id])
        ) {
          await context.dispatch("fetchQuestById", {
            full,
            params: { id: quest_id },
          });
        }
      },
      createQuest: async (context, { data }) => {
        const res = await context.dispatch("createQuestBase", { data });
        // Refetch to get memberships.
        // TODO: maybe add representation to creation instead?
        const quest_id = res.data[0].id;
        await context.dispatch("fetchQuestById", { params: { id: quest_id } });
        // TODO: Get the membership from the quest
        await MyVapi.store.dispatch("member/fetchLoginUser");
      },
      ensureAllQuests: async (context) => {
        if (context.state.quests.length === 0 || !context.state.fullFetch) {
          await context.dispatch("fetchQuests");
        }
      },
      ensureCurrentQuest: async (context, quest_id, full = true) => {
        await context.dispatch("ensureQuest", quest_id, full);
        await context.dispatch("setCurrentQuest", quest_id);
      },
      clearState: (context) => {
        context.commit("CLEAR_STATE");
      },
    },
    mutations: {
      SET_CURRENT_QUEST: (state, quest_id) => {
        state.currentQuest = Number.parseInt(quest_id);
      },
      CLEAR_STATE: (state) => {
        state.quests = {};
        state.currentQuest = null;
        state.fullFetch = false;
        state.fullQuests = {};
      },
    },
  });

export default quests;
