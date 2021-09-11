import MyVapi from "./base"

const quests = new MyVapi({
  state: {
    quests: []
  },
})
  // Step 3
  .get({
    action: "getQuestById",
    queryParams: true,
    path: (id) => `/quests?id=eq.${id}`,
  })
  .get({
    action: "findQuests",
    property: "quests",
    path: '/quests',
    queryParams: true,
    beforeRequest: (state, actionParams) => {
      const userId = MyVapi.store.getters["member/getUserId"]
      if (userId) {
        actionParams.params = {
          select: '*,quest_membership(*),casting(*),game_play(*)',
          'guild_membership.member_id': `eq.${userId}`,
          'casting.member_id': `eq.${userId}`
        }
      } else {
        actionParams.params = {
          select: '*,game_play(*)',
        }
      }
    },
  })
  // Step 4
  .getStore({
    getters: {
      getQuestByStatus: (state) => (status) =>
        state.quests.filter(quest => quest.status === status),
      getQuests: (state) =>
        state.quests,
      getQuestById: (state) => (id) =>
        state.quests.find(quest => quest.id === id),
      getMyQuests: (state) =>
        state.quests.filter(quest => quest.quest_membership && quest.quest_membership.length),
      getPlayingQuests: (state) =>
        state.quests.filter(quest => quest.casting && quest.casting.length),
      isQuestMember: (state) => (guild_id) =>
        state.quests.find(quest => quest.id === id)?.quest_membership.find(m => m.member_id === MyVapi.store.getters["member/getUserId"]),
    },
    actions: {
      setCurrentQuest: (context, quest) => {
        context.commit('SET_CURRENT_QUEST', quest);
      }
    },
    mutations: {
      SET_CURRENT_QUEST: (state, quest) => {
        state.currentQuest = quest;
      }
    },
  })

export default quests;
