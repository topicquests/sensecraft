import { defineStore } from 'pinia';
//import { filterKeys} from './base';
import { AxiosResponse } from 'axios';
import { useMemberStore } from './member';
import { useMembersStore } from './members';
import { useGuildStore } from './guilds';
import { useRoleStore } from './role';
// import { useConversationStore } from './conversation';
import { api } from '../boot/axios';

import {
  QuestData,
  Guild,
  Quest,
  Casting,
  QuestMembership,
  GamePlay,
  CastingRole,
  Role,
  PublicMember,
} from '../types';
import {
  quest_status_enum,
  ibis_node_type_type,
  publication_state_enum,
  publication_state_type,
  publication_state_list,
} from '../enums';

//import type { RoleState } from './role';
//import { getWSClient } from '../wsclient';

interface QuestMap {
  [key: number]: QuestData;
}
export interface QuestsState {
  quests: QuestMap;
  fullQuests: { [key: number]: boolean };
  fullFetch: boolean;
  currentQuest?: number;
}

const baseState: QuestsState = {
  currentQuest: null,
  fullFetch: false,
  quests: {},
  fullQuests: {},
};

export const useQuestStore = defineStore('quest', {
  state: () => baseState,
  getters: {
    getCurrentQuest: (state: QuestsState) => state.quests[state.currentQuest],
    getQuests(): QuestsData[] {
      return Object.values(this.quests);
    },
    getQuestById: (state: QuestsState) => (id: number) => state.quests[id],
    getMyQuests: (state: QuestsState) => {
      const member_id = useMemberStore().getUserId;
      return Object.values(state.quests).filter((quest: QuestData) =>
        quest?.quest_membership?.find(
          (m: QuestMembership) => m.member_id == member_id && m.confirmed,
        ),
      );
    },
    getActiveQuests: (state: QuestsState): quests =>
      Object.values(state.quests).filter(
        (quest) =>
          ['ongoing', 'paused', 'registration'].indexOf(quest.status) >= 0,
      ),
    getPlayingQuests: (state: QuestsState) => {
      const member_id = useMemberStore().getUserId;
      return Object.values(state.quests).filter((quest: QuestData) =>
        quest.casting?.find((c: Casting) => c.member_id == member_id),
      );
    },
    getPlayers: (state: QuestsState) => (quest_id: number) =>
      state.quests[quest_id]?.casting?.map((c: Casting) =>
        useMembersStore().getMemberById(c.member_id),
      ),
    getPlayersInGuild:
      (state: QuestsState) => (quest_id: number, guild_id: number) =>
        state.quests[quest_id]?.casting
          ?.filter((c: Casting) => c.guild_id == guild_id)
          .map((c: Casting) => useMembersStore().getMemberById(c.member_id)),
    isQuestMember: (state: QuestsState) => (quest_id: number) => {
      const member_id = useMemberStore().getUserId;
      return state.quests[quest_id]?.quest_membership?.find(
        (m: QuestMembership) => m.member_id == member_id && m.confirmed,
      );
    },
    getCurrentGamePlay: (state: QuestsState) => {
      if (state.currentQuest) {
        const quest = state.quests[state.currentQuest];
        const currentGuild: Guild = useGuildStore().getCurrentGuild;
        if (currentGuild) {
          return quest?.game_play?.find(
            (gp: GamePlay) => gp.guild_id == currentGuild.id,
          );
        }
      }
    },
    getCastingRoles:
      () =>
      (member_id: number): Role[] => {
        const castingRoles = useMembersStore().getPlayersRoles(member_id);
        const roles = castingRoles.map((pr) =>
          useRoleStore().getRoleById(pr.role_id),
        );
        return roles;
      },
    getCastingRolesForQuest:
      () =>
      (member_id: number, quest_id: number): Role[] => {
        const castingRoles = useMembersStore().getPlayersRoles(member_id);
        const playerRoles = castingRoles.filter(
          (role) => role.quest_id == quest_id,
        );
        const roles = playerRoles.map((pr) =>
          useRoleStore().getRoleById(pr.role_id),
        );
        return roles;
      },
    getPlayersOfCurrentQuestGuild: (state: QuestsState) => {
      const quest = state.quests[state.currentQuest];
      const members = useMemberStore().members;
      const currentGuildId = useGuildStore().currentGuild;
      if (!currentGuildId) return [];
      return quest.casting
        .filter((c: Casting) => c.guild_id == currentGuildId)
        .map((c: Casting) => members[c.member_id])
        .filter((member: PublicMember) => member);
    },
    isPlayingQuestInGuild:
      (state: QuestsState) =>
      (quest_id?: number, guild_id?: number, member_id?: number) => {
        member_id = member_id || useMemberStore().getUserId;
        quest_id = quest_id || state.currentQuest;
        return state.quests[quest_id]?.casting?.find(
          (c: Casting) => c.member_id == member_id && c.guild_id == guild_id,
        );
      },
    isPlayingQuestAsGuildId:
      (state: QuestsState) => (quest_id?: number, member_id?: number) => {
        member_id = member_id || useMemberStore().getUserId;
        quest_id = quest_id || state.currentQuest;
        const casting = state.quests[quest_id]?.casting?.find(
          (c: Casting) => c.member_id == member_id,
        );
        return casting?.guild_id;
      },
    castingInQuest:
      (state: QuestsState) => (quest_id?: number, member_id?: number) => {
        member_id = member_id || useMemberStore().getUserId;
        quest_id = quest_id || state.currentQuest;
        return state.quests[quest_id]?.casting?.find(
          (c: Casting) => c.member_id == member_id,
        );
      },
    getCastingRolesById:
      () =>
      (member_id: number, quest_id: number): Role[] => {
        const castingRoles = useMembersStore().getPlayersRoles(member_id);
        const playerRoles = castingRoles?.filter(
          (role) => role.quest_id == quest_id,
        );
        return playerRoles;
      },
    getMembersOfCurrentQuest: (state: QuestsState) => {
      const quest = state.quests[state.currentQuest];
      const members = useMemberStore().members;
      return quest?.quest_membership
        ?.map((qm: QuestMembership) => members[qm.member_id])
        .filter((member: PublicMember) => member);
    },
    isGuildPlayingQuest:
      (state: QuestsState) => (quest_id?: number, guild_id?: number) => {
        quest_id = quest_id || state.currentQuest;
        return state.quests[quest_id]?.casting?.find(
          (c: Casting) => c.guild_id == guild_id,
        );
      },
    getPlayersOfCurrentQuest: (state: QuestsState) => {
      const quest = state.quests[state.currentQuest];
      const members = useMemberStore().members;
      return quest?.casting
        .map((c: Casting) => members[c.member_id])
        .filter((member: PublicMember) => member);
    },
    getGamePlayForGuild:
      (state: QuestsState) =>
      (guild_id: number): GamePlay => {
        if (state.currentQuest) {
          const quest = state.quests[state.currentQuest];
          return quest?.game_play?.find(
            (gp: GamePlay) => gp.guild_id == guild_id,
          );
        }
      },
    getQuestsByStatus: (state: QuestsState) => (status: quest_status_enum) =>
      Object.values(state.quests).filter(
        (quest: QuestData) => quest.status == status,
      ),
    getMaxPubStateForNodeType:
      () =>
      (
        quest_id: number,
        node_type: ibis_node_type_type,
      ): publication_state_type => {
        const roleCastings: CastingRole[] =
          useMemberStore().castingRolesForQuest(quest_id);
        const roles: Role[] = roleCastings.map((rc) =>
          useRoleStore().getRoleById(rc.role_id),
        );
        let maxPubStates = roles.map((role) => role.max_pub_state);
        maxPubStates = maxPubStates.concat(
          roles.map(
            (role) =>
              role.role_node_constraint.find((x) => x.node_type == node_type)
                ?.max_pub_state,
          ),
        );
        maxPubStates = maxPubStates.filter((x) => x != undefined);
        if (maxPubStates.length > 0) {
          // maximum for all roles
          maxPubStates.sort(
            (a, b) =>
              publication_state_list.indexOf(b) -
              publication_state_list.indexOf(a),
          );
          return maxPubStates[0];
        }
        // no constraint
        return publication_state_enum.submitted;
      },
  },
  actions: {
    async ensureAllQuests(): Quest[] {
      if (Object.keys(this.quests).length === 0 || !this.fullFetch) {
        await this.fetchQuests();
        return this.quests;
      }
    },
    async fetchQuests(
      id: undefined | number | Array<number>,
    ): Promise<QuestData[]> {
      const userId = useMemberStore().getUserId;
      const params = Object();
      if (id !== undefined) {
        if (Array.isArray(id)) {
          params.id = `in.(${id.join(',')})`;
        } else {
          params.id = `eq.${id}`;
        }
      }
      if (userId !== undefined) {
        Object.assign(params, {
          select:
            '*,quest_membership!quest_id(*),casting!quest_id(*),game_play!quest_id(*)',
          'quest_membership.member_id': `eq.${userId}`,
          'casting.member_id': `eq.${userId}`,
        });
      } else {
        params.select = '*,game_play!quest_id(*)';
      }

      const res: AxiosResponse<QuestData[]> = await api.get('/quests_data');
      if (res.status == 200) {
        const fullQuests = Object.values(this.quests).filter(
          (quest: QuestData) => this.fullQuests[quest.id],
        );
        const quests = Object.fromEntries(
          res.data.map((quest: QuestData) => [quest.id, quest]),
        );
        for (const quest of fullQuests) {
          if (quests[quest.id]) {
            quests[quest.id] = Object.assign(quests[quest.id], {
              casting: quest.casting,
              quest_membership: quest.quest_membership,
            });
          }
        }
        this.quests = quests;
        this.fullFetch = true;
        return res.data;
      }
    },
    async ensureQuest({
      quest_id,
      full = true,
    }: {
      quest_id: number;
      full?: boolean;
    }) {
      if (
        this.getQuestById(quest_id) === undefined ||
        (full && !this.fullQuests[quest_id])
      ) {
        await this.fetchQuestById(quest_id, full);
      }
    },
    createQuest: async (context, { data }) => {
      const res = await context.dispatch('createQuestBase', { data });
      // Refetch to get memberships.
      // TODO: maybe add representation to creation instead?
      const quest_id = res.data[0].id;
      await context.dispatch('fetchQuestById', { quest_id });
      // TODO: Get the membership from the quest
      await useMemberStore().fetchLoginUser();
      // await useConversationStore().resetConversation();
      return res.data[0];
    },

    ensureCurrentQuest: async (context, { quest_id, full = true }) => {
      await context.dispatch('ensureQuest', { quest_id, full });
      await context.dispatch('setCurrentQuest', quest_id);
    },
    resetQuests: () => {
      Object.assign(baseState);
    },

    async fetchQuestById(id: number | number[], full?: boolean) {
      const params = Object();
      if (Array.isArray(id)) {
        params.id = `in.(${id.join(',')})`;
      } else {
        params.id = `eq.${id}`;
      }
      const userId = useMemberStore().getUserId;
      if (userId || full) {
        params.select =
          '*,quest_membership!quest_id(*),casting!quest_id(*),game_play!quest_id(*)';
        if (!full) {
          Object.assign(params, {
            'quest_membership.member_id': `eq.${userId}`,
            'casting.member_id': `eq.${userId}`,
          });
        }
      } else {
        params.select = '*,game_play!quest_id(*)';
      }
      const res: AxiosResponse<QuestData[]> = await api.get('/quests', params);
      if (res.status == 200) {
        this.quests = {
          ...this.quests,
          ...Object.fromEntries(
            res.data.map((quest: QuestData) => [quest.id, quest]),
          ),
        };
        if (full) {
          this.fullQuests = {
            ...this.fullQuests,
            ...Object.fromEntries(
              res.data.map((quest: QuestData) => [quest.id, true]),
            ),
          };
        }
      }
    },
    async addCasting(casting: Partial<Casting>) {
      const memberStore = useMemberStore();
      const res: AxiosResponse<Casting[]> = await api.post('/casting', casting);
      if (res.status == 200) {
        const casting = res.data[0];
        let quest = this.quests[casting.quest_id];
        if (quest) {
          const castings = quest.casting || [];
          castings.push(casting);
          quest = { ...quest, casting: castings };
          this.quests = { ...this.quests, [quest.id]: quest };
        }
        if ((casting.member_id = memberStore.getUserId) && memberStore.member) {
          const castings = (memberStore.member.casting || []).filter(
            (c: Casting) => c.quest_id != casting.quest_id,
          );
          castings.push(casting);
          memberStore.member.casting = castings;
        }
      }
    },
    async addCastingRole(castingRole: Partial<CastingRole>) {
      const memberStore = useMemberStore();
      const membersStore = useMembersStore();
      if(res==200) {
        const castingRole = res.data[0];
        if ((castingRole.member_id = memberStore.getUserId)) {
          if (memberStore.member) {
            const castingRoles =
              memberStore.member.casting_role.filter(
                (cr: CastingRole) => cr.role_id != casting_role.role_id
              ) || [];
            castingRoles.push(casting_role);
            memberStore.member.casting_role = castingRoles;
          }
        }
        const member_id = castingRole.member_id;
          let member = memberStore.members[member_id];
          if (member) {
            const casting_role =
              member.casting_role?.filter(
                (cr: CastingRole) => cr.role_id != castingRole.role_id
              ) || [];
            casting_role.push(castingRole);
            member = { ...member, casting_role };
            membersStore.members = { ...membersStore.members, [member_id]: member };
        }
      }
    },
    //deleteCastingRole: RestDataActionType<Partial<CastingRole>, CastingRole[]>;
    async deleteCastingRole(): Promise<Partial<CastingRole>> {
      
    }
  },
});
/*
  },
  actions: {
  setCurrentQuest(quest_id: number) {
    this.currentQuest = quest_id;
    //getWSClient().setDefaultQuest(quest_id);
  },

  setCastingRole: (role_id: number) => {
    //context.commit("SET_CASTING_ROLE", role_id);
  },
  */

/*

});
    .post({
      action: "createQuestBase",
      path: "/quests",
      onSuccess: (
        state: QuestsState,
        res: AxiosResponse<Quest[]>,
        axios: AxiosInstance,
        { data }
      ) => {
        const questData: QuestData = Object.assign(res.data[0], {
          last_node_published_at: null,
          node_count: 0,
          confirmed_guild_count: 0,
          interested_guild_count: 0,
          player_count: 0,
          is_playing: false,
          my_confirmed_guild_count: 0,
          my_recruiting_guild_count: 0,
          is_quest_member: true,
        });
        state.quests = { ...state.quests, [questData.id]: questData };
      },
    })
    .patch({
      action: "updateQuest",
      path: ({ id }) => `/quests?id=eq.${id}`,
      beforeRequest: (state: QuestsState, actionParams) => {
        const { params, data } = actionParams;
        params.id = data.id;
        actionParams.data = filterKeys(data, questPatchKeys);
      },
      onSuccess: (
        state: QuestsState,
        res: AxiosResponse<Quest[]>,
        axios: AxiosInstance,
        { data }
      ) => {
        const quest = res.data[0];
        // Update the QuestData with the Quest object;
        // assume other fields were not affected.
        const questData: QuestData = Object.assign(
          {},
          state.quests[quest.id],
          quest
        );
        state.quests = { ...state.quests, [quest.id]: questData };
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
      path: ({ id }) => `/quest_membership?id=eq.${id}`,
      beforeRequest: (state: QuestsState, { params, data }) => {
        params.id = data.id;
      },
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
      path: ({ id }) => `/game_play?id=eq.${id}`,
      beforeRequest: (state: QuestsState, { params, data }) => {
        params.id = data.id;
      },
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
    
    .patch({
      action: "updateCasting",
      path: ({ id }) => `/casting?id=eq.${id}`,
      beforeRequest: (state: QuestsState, { params, data }) => {
        params.id = data.id;
      },
      onSuccess: (
        state: QuestsState,
        res: AxiosResponse<Casting[]>,
        axios: AxiosInstance,
        actionParams
      ) => {
        const casting = res.data[0];
        const quest = state.quests[casting.quest_id];
        if (quest) {
          const castings =
            quest.casting?.filter(
              (gp: Casting) => gp.quest_id !== casting.quest_id
            ) || [];
          castings.push(casting);
          quest.casting = castings;
        }
        const store = MyVapi.store;
        if ((casting.member_id = store.getters["member/getUserId"])) {
          store.commit("member/ADD_CASTING", casting);
        }
      },
    })
    
    .patch({
      action: "updateCasting",
      path: ({ id }) => `/casting?id=eq.${id}`,
      beforeRequest: (state: QuestsState, { params, data }) => {
        params.id = data.id;
      },
      onSuccess: (
        state: QuestsState,
        res: AxiosResponse<Casting[]>,
        axios: AxiosInstance,
        actionParams
      ) => {
        const casting = res.data[0];
        const quest = state.quests[casting.quest_id];
        if (quest) {
          const castings =
            quest.casting?.filter(
              (gp: Casting) => gp.quest_id !== casting.quest_id
            ) || [];
          castings.push(casting);
          quest.casting = castings;
        }
        const store = MyVapi.store;
        if ((casting.member_id = store.getters["member/getUserId"])) {
          store.commit("member/ADD_CASTING", casting);
        }
      },
    })
    .delete({
      action: "deleteCastingRole",
      path: ({ member_id, guild_id, role_id, quest_id }) =>
        `/casting_role?member_id=eq.${member_id}&guild_id=eq.${guild_id}&role_id=eq.${role_id}&quest_id=eq.${quest_id}`,
      onSuccess: (
        state: QuestsState,
        res: AxiosResponse<CastingRole[]>,
        axios: AxiosInstance,
        actionParams
      ) => {
        if (
          MyVapi.store.getters["member/getUserId"] ==
          actionParams.params.member_id
        ) {
          MyVapi.store.commit("member/REMOVE_CASTING_ROLE", actionParams);
        }
        MyVapi.store.commit("members/REMOVE_CASTING_ROLE", actionParams);
      },
    })
    .call({
      action: "endTurn",
      path: "end_turn",
    })
    // Step 4
    .getVuexStore({
      getters: QuestsGetters,
      actions: QuestsActions,
      mutations: {
        SET_CURRENT_QUEST: (state: QuestsState, quest_id: number) => {
          state.currentQuest = quest_id;
          getWSClient().setDefaultQuest(quest_id);
        },
        SET_CASTING_ROLE: (state: RoleState, role_id: number) => {
          // TODO
        },
        CLEAR_STATE: (state: QuestsState) => {
          Object.assign(state, baseState);
        },
      },
    });

type QuestsRestActionTypes = {
 
  createQuestBase: RestDataActionType<Partial<Quest>, QuestData[]>;
  updateQuest: RestDataActionType<Partial<Quest>, QuestData[]>;
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
  updateCasting: RestDataActionType<Partial<Casting>, Casting[]>;
  addCastingRole: RestDataActionType<Partial<CastingRole>, CastingRole[]>;
  updateCastingRole: RestDataActionType<Partial<CastingRole>, CastingRole[]>;
  
  endTurn: RestDataActionType<{ quest_id: number }, void>;
};

export type QuestsActionTypes = RetypeActionTypes<typeof QuestsActions> &
  QuestsRestActionTypes;
export type QuestsGetterTypes = RetypeGetterTypes<typeof QuestsGetters>;
*/
