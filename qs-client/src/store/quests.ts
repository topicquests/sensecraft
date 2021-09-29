import {
  MyVapi,
  RestActionType,
  RestDataActionType,
  RestEmptyActionType,
  RetypeActionTypes,
  RetypeGetterTypes,
} from "./base";
import { AxiosResponse, AxiosInstance } from "axios";
import { Quest, Casting, QuestMembership, GamePlay } from "../types";
import { quest_status_enum } from "../enums";
interface QuestMap {
  [key: number]: Quest;
}
export interface QuestsState {
  quests: QuestMap;
  fullQuests: { [key: number]: boolean };
  fullFetch: boolean;
  currentQuest?: number;
}

const QuestsGetters = {
  getQuestsByStatus: (state: QuestsState) => (status: quest_status_enum) =>
    Object.values(state.quests).filter(
      (quest: Quest) => quest.status == status
    ),
  getQuests: (state: QuestsState) => Object.values(state.quests),
  getQuestById: (state: QuestsState) => (id: number) => state.quests[id],
  getCurrentQuest: (state: QuestsState) => state.quests[state.currentQuest],
  getMyQuests: (state: QuestsState) => {
    const member_id = MyVapi.store.getters["member/getUserId"];
    return Object.values(state.quests).filter((quest: Quest) =>
      quest?.quest_membership?.find(
        (m: QuestMembership) => m.member_id == member_id && m.confirmed
      )
    );
  },
  getPlayingQuests: (state: QuestsState) => {
    const member_id = MyVapi.store.getters["member/getUserId"];
    return Object.values(state.quests).filter((quest: Quest) =>
      quest.casting?.find((c: Casting) => c.member_id == member_id)
    );
  },
  getPlayers: (state: QuestsState) => (quest_id: number) =>
    state.quests[quest_id]?.casting?.map((c: Casting) =>
      MyVapi.store.getters["members/getMemberById"](c.member_id)
    ),
  getPlayersInGuild:
    (state: QuestsState) => (quest_id: number, guild_id: number) =>
      state.quests[quest_id]?.casting
        ?.filter((c: Casting) => c.guild_id == guild_id)
        .map((c: Casting) =>
          MyVapi.store.getters["members/getMemberById"](c.member_id)
        ),
  isQuestMember: (state: QuestsState) => (quest_id: number) => {
    const member_id = MyVapi.store.getters["member/getUserId"];
    return state.quests[quest_id]?.quest_membership?.find(
      (m: QuestMembership) => m.member_id == member_id && m.confirmed
    );
  },
  castingInQuest:
    (state: QuestsState) => (quest_id?: number, member_id?: number) => {
      member_id = member_id || MyVapi.store.getters["member/getUserId"];
      quest_id = quest_id || state.currentQuest;
      return state.quests[quest_id]?.casting?.find(
        (c: Casting) => c.member_id == member_id
      );
    },
};

export const QuestsActions = {
  setCurrentQuest: (context, quest_id: number) => {
    context.commit("SET_CURRENT_QUEST", quest_id);
  },
  ensureQuest: async (
    context,
    { quest_id, full = true }: { quest_id: number; full?: boolean }
  ) => {
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
  ensureCurrentQuest: async (context, { quest_id, full = true }) => {
    await context.dispatch("ensureQuest", { quest_id, full });
    await context.dispatch("setCurrentQuest", quest_id);
  },
  clearState: (context) => {
    context.commit("CLEAR_STATE");
  },
};

export const quests = new MyVapi<QuestsState>({
  state: {
    currentQuest: null,
    fullFetch: false,
    quests: {},
    fullQuests: {},
  } as QuestsState,
})
  // Step 3
  .get({
    action: "fetchQuestById",
    path: "/quests",
    queryParams: true,
    beforeRequest: (state: QuestsState, { full, params }) => {
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
    onSuccess: (
      state: QuestsState,
      res: AxiosResponse<Quest[]>,
      axios: AxiosInstance,
      actionParams
    ) => {
      state.quests = {
        ...state.quests,
        ...Object.fromEntries(
          res.data.map((quest: Quest) => [quest.id, quest])
        ),
      };
      if (actionParams.full) {
        state.fullQuests = {
          ...state.fullQuests,
          ...Object.fromEntries(
            res.data.map((quest: Quest) => [quest.id, true])
          ),
        };
      }
    },
  })
  .get({
    action: "fetchQuests",
    property: "quests",
    path: "/quests",
    queryParams: true,
    beforeRequest: (state: QuestsState, { params }) => {
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
    onSuccess: (
      state: QuestsState,
      res: AxiosResponse<Quest[]>,
      axios: AxiosInstance,
      actionParams
    ) => {
      const fullQuests = Object.values(state.quests).filter(
        (quest: Quest) => state.fullQuests[quest.id]
      );
      const quests = Object.fromEntries(
        res.data.map((quest: Quest) => [quest.id, quest])
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
    onSuccess: (
      state: QuestsState,
      res: AxiosResponse<Quest[]>,
      axios: AxiosInstance,
      { data }
    ) => {
      const quest = res.data[0];
      state.quests = { ...state.quests, [quest.id]: quest };
    },
  })
  .patch({
    action: "updateQuest",
    path: ({ id }) => `/quests?id=eq.${id}`,
    beforeRequest: (state: QuestsState, { params, data }) => {
      params.id = data.id;
      Object.assign(data, {
        casting: undefined,
        quest_membership: undefined,
        game_play: undefined,
        updated_at: undefined,
      });
    },
    onSuccess: (
      state: QuestsState,
      res: AxiosResponse<Quest[]>,
      axios: AxiosInstance,
      { data }
    ) => {
      let quest = res.data[0];
      quest = Object.assign({}, state.quests[quest.id], quest);
      state.quests = { ...state.quests, [quest.id]: quest };
      state.fullQuests = { ...state.fullQuests, [quest.id]: undefined };
    },
  })
  .post({
    action: "addQuestMembership",
    path: "/quest_membership",
    onSuccess: (
      state: QuestsState,
      res: AxiosResponse<QuestMembership[]>,
      axios: AxiosInstance,
      actionParams
    ) => {
      const membership = res.data[0];
      const quest = state.quests[membership.quest_id];
      if (quest) {
        const memberships = quest.quest_membership || [];
        memberships.push(membership);
        quest.quest_membership = memberships;
      }
      MyVapi.store.commit("member/ADD_QUEST_MEMBERSHIP", membership);
    },
  })
  .patch({
    action: "updateQuestMembership",
    path: "/quest_membership",
    onSuccess: (
      state: QuestsState,
      res: AxiosResponse<QuestMembership[]>,
      axios: AxiosInstance,
      actionParams
    ) => {
      const membership = res.data[0];
      const quest = state.quests[membership.quest_id];
      if (quest) {
        const memberships =
          quest.quest_membership?.filter(
            (gp: QuestMembership) => gp.quest_id !== membership.quest_id
          ) || [];
        memberships.push(membership);
        quest.quest_membership = memberships;
      }
      MyVapi.store.commit("member/ADD_QUEST_MEMBERSHIP", membership);
    },
  })
  .post({
    action: "addGamePlay",
    path: "/game_play",
    onSuccess: (
      state: QuestsState,
      res: AxiosResponse<GamePlay[]>,
      axios: AxiosInstance,
      actionParams
    ) => {
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
    onSuccess: (
      state: QuestsState,
      res: AxiosResponse<GamePlay[]>,
      axios: AxiosInstance,
      actionParams
    ) => {
      const game_play = res.data[0];
      const quest = state.quests[game_play.quest_id];
      if (quest) {
        const game_plays =
          quest.game_play?.filter(
            (gp: GamePlay) => gp.quest_id !== game_play.quest_id
          ) || [];
        game_plays.push(game_play);
        quest.game_play = game_plays;
      }
      MyVapi.store.commit("guilds/ADD_GAME_PLAY", game_play);
    },
  })
  .post({
    action: "addCasting",
    path: "/casting",
    onSuccess: (
      state: QuestsState,
      res: AxiosResponse<Casting[]>,
      axios: AxiosInstance,
      actionParams
    ) => {
      const casting = res.data[0];
      console.log(res);
      const quest = state.quests[casting.quest_id];
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
  .getVuexStore({
    getters: QuestsGetters,
    actions: QuestsActions,
    mutations: {
      SET_CURRENT_QUEST: (state: QuestsState, quest_id: number) => {
        state.currentQuest = quest_id;
      },
      CLEAR_STATE: (state: QuestsState) => {
        state.quests = {};
        state.currentQuest = null;
        state.fullFetch = false;
        state.fullQuests = {};
      },
    },
  });

type QuestsRestActionTypes = {
  fetchQuestById: ({
    full,
    params,
  }: {
    full?: boolean;
    params: { id: number | number[] };
  }) => Promise<AxiosResponse<Quest[]>>;
  fetchQuests: RestEmptyActionType<Quest[]>;
  createQuestBase: RestDataActionType<Partial<Quest>, Quest[]>;
  updateQuest: RestActionType<{ id: number }, Partial<Quest>, Quest[]>;
  addQuestMembership: RestDataActionType<
    Partial<QuestMembership>,
    QuestMembership[]
  >;
  updateQuestMembership: RestDataActionType<
    Partial<QuestMembership>,
    QuestMembership[]
  >;
  addGamePlay: RestDataActionType<Partial<GamePlay>, GamePlay[]>;
  updateGamePlay: RestDataActionType<Partial<GamePlay>, GamePlay[]>;
  addCasting: RestDataActionType<Partial<Casting>, Casting[]>;
};

export type QuestsActionTypes = RetypeActionTypes<typeof QuestsActions> &
  QuestsRestActionTypes;
export type QuestsGetterTypes = RetypeGetterTypes<typeof QuestsGetters>;
