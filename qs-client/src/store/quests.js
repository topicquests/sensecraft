import MyVapi from "./base"

const quests = new MyVapi({
  state: {
    currentQuest: null,
    singleFetch: true,
    quests: []
  },
})
  // Step 3
  .get({
    action: "fetchQuestById",
    path: '/quests',
    queryParams: true,
    beforeRequest: (state, actionParams) => {
      const { params } = actionParams
      params.id = `eq.${params.id}`
      const userId = MyVapi.store.getters["member/getUserId"]
      if (userId) {
        actionParams.params = Object.assign(params, {
          select: '*,quest_membership(*),casting(*),game_play(*)',
          'guild_membership.member_id': `eq.${userId}`,
          'casting.member_id': `eq.${userId}`
        })
      } else {
        actionParams.params = Object.assign(params, {
          select: '*,game_play(*)',
        })
      }
    },
    onSuccess: (state, res, axios, actionParams) => {
      const quest = res.data[0]
      if (state.quests) {
        const quests = state.quests.filter(q => q.id !== quest.id)
        quests.push(quest)
        state.quests = quests
      } else {
        state.quests = [quest]
        state.singleFetch = true
      }
    },
  })
  .get({
    action: "fetchQuests",
    property: "quests",
    path: '/quests',
    queryParams: true,
    beforeRequest: (state, actionParams) => {
      const userId = MyVapi.store.getters["member/getUserId"]
      if (userId) {
        actionParams.params = {
          select: '*,quest_membership(*),casting(*),game_play(*)',
          'quest_membership.member_id': `eq.${userId}`,
          'casting.member_id': `eq.${userId}`
        }
      } else {
        actionParams.params = {
          select: '*,game_play(*)',
        }
      }
    },
    onSuccess: (state, res, axios, actionParams) => {
      state.quests = res.data
      state.singleFetch = false
    },
  })
  .post({
    action: "createQuest",
    path: '/quests',
    onSuccess: (state, res, axios, { data }) => {
      state.quests = [...state.quests, res.data]
    }
  })
  .patch({
    action: "updateQuest",
    path: ({id}) => `/quests?id=eq.${id}`,
    beforeRequest: (state, { params, data }) => {
      params.id = data.id
      Object.assign(data, {casting: undefined, quest_membership: undefined, game_play: undefined, updated_at: undefined})
    },
    onSuccess: (state, res, axios, { data }) => {
      console.log(res.data)
      const quest = res.data[0]
      const quests = state.quests.filter(q => q.id !== quest.id)
      quests.push(quest)
      state.quests = quests
    }
  })
  .post({
    action: "addCasting",
    path: '/casting',
    onSuccess: (state, res, axios, actionParams) => {
      const casting = res.data;
      console.log(res);
      const quest = state.quests.find(q => q.id === casting.quest_id);
      if (quest) {
        if (quest.casting === undefined)
          quest.casting = [];
        quest.casting.append(casting);
      }
    },
  })
  .call({
    action: 'registerAllMembers',
    path: 'register_all_members',
    queryParams: true,
    // TODO: modify castings appropriately. May need an appropriate mutation.
  })
  // Step 4
  .getStore({
    getters: {
      getQuestsByStatus: (state) => (status) =>
        state.quests.filter(quest => quest.status == status),
      getQuests: (state) =>
        state.quests,
      getQuestById: (state) => (id) =>
        state.quests.find(quest => quest.id == id),
      getCurrentQuest: (state) =>
        state.quests.find(quest => quest.id == state.currentQuest),
      getMyQuests: (state) =>
        state.quests.filter(quest => quest?.quest_membership?.find(m => m.member_id == MyVapi.store.getters["member/getUserId"] && m.confirmed)),
      getPlayingQuests: (state) =>
        state.quests.filter(quest => quest.casting && quest.casting.length),
      isQuestMember: (state) => (quest_id) =>
        state.quests.find(quest => quest.id == quest_id)?.quest_membership?.find(m => m.member_id == MyVapi.store.getters["member/getUserId"] && m.confirmed),
      castingInQuest: (state) => (quest_id) =>
        state.quests.find(quest => quest.id == quest_id)?.casting.find(c => c.member_id == MyVapi.store.getters["member/getUserId"]),
    },
    actions: {
      setCurrentQuest: (context, quest_id) => {
        context.commit('SET_CURRENT_QUEST', quest_id);
      },
      ensureQuest: async (context, quest_id) => {
        if (context.getters.getQuestById(quest_id) === undefined) {
          await context.dispatch('fetchQuestById', { params: { id: quest_id } });
        }
      },
      ensureAllQuests: async (context) => {
        if (context.state.quests.length === 0 || context.state.singleFetch) {
          await context.dispatch('fetchQuests');
        }
      },
      ensureCurrentQuest: async (context, quest_id) => {
        await context.dispatch('ensureQuest', quest_id);
        await context.dispatch('setCurrentQuest', quest_id);
      },
      clearState: (context) => {
        context.commit('CLEAR_STATE');
      },
    },
    mutations: {
      SET_CURRENT_QUEST: (state, quest_id) => {
        state.currentQuest = quest_id;
      },
      CLEAR_STATE: (state) => {
        state.quests = [];
        state.currentQuest = null;
        state.singleFetch = true;
      },
    },
  })

export default quests;
