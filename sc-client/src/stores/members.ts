import { defineStore } from 'pinia';
import { filterKeys } from './base';
import { AxiosResponse, AxiosInstance } from 'axios';
import {
  PublicMember,
  GuildMembership,
  QuestMembership,
  Casting,
  GuildMemberAvailableRole,
  CastingRole,
  memberPatchKeys,
} from '../types';

import { useGuildStore } from './guilds';
import { useQuestStore } from './quests';
import { useMemberStore } from './member';

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
const baseState: MembersState = {
  fullFetch: false,
  questFetch: undefined,
  guildFetch: undefined,
  members: {},
  fullMembers: {},
};

export const useMembersStore = defineStore('members', {
  state: () => baseState,
  getters: {
    getMembers: (state: MembersState) =>
      Object.values(state.members).sort((a, b) =>
        a.handle.localeCompare(b.handle),
      ),
    getMemberById: (state: MembersState) => (id: number) => {
      const member = state.members[id];
      if (member) return member;
      // may also be in member
      const loggedIn = useMemberStore().member;
      if (loggedIn?.id == id) return loggedIn;
    },
    getMemberByHandle: (state: MembersState) => (handle: string) =>
      Object.values(state.members).find(
        (member: PublicMember) => member.handle == handle,
      ),
    getMembersByHandle: (state: MembersState) =>
      Object.fromEntries(
        Object.values(state.members).map((member: PublicMember) => [
          member.handle,
          member,
        ]),
      ),
    getMemberHandles: (state: MembersState) =>
      Object.values(state.members)
        .map((member: PublicMember) => member.handle)
        .sort(),
    getPlayersRoles: (state: MembersState) => (member_id: number) => {
      return state.members[member_id]?.casting_role;
    },
    getAvailableRolesByMemberId:
      (state: MembersState) => (member_id: number) => {
        return state.members[member_id]?.guild_member_available_role;
      },
    getAvailableRolesForMemberAndGuild:
      (state: MembersState) => (member_id: number, guild_id: number) => {
        const roles =
          state.members[member_id]?.guild_member_available_role || [];
        return roles.filter((cr) => cr.guild_id == guild_id);
      },
    castingRolesPerQuest:
      (state: MembersState) => (member_id: number, quest_id: number) => {
        const castingRole: CastingRole[] = [];
        const rolesPerQuest = state.members[member_id].casting_role;
        if (rolesPerQuest !== undefined && rolesPerQuest.length > 0) {
          rolesPerQuest.forEach((cr) => {
            if (cr.quest_id == quest_id) {
              castingRole.push(cr);
            }
          });
          return castingRole;
        }
        return [];
      },
  },

  actions: {
    async ensureAllMembers() {
      if (Object.keys(this.members).length === 0 || !this.fullFetch) {
        //await context.dispatch("fetchMembers");
      }
    },
    async ensureMemberById({
      id,
      full = true,
    }: {
      id: number;
      full?: boolean;
    }) {
      if (!this.members[id]) {
        //await context.dispatch("fetchMemberById", { full, params: { id } });
      }
    },
    async reloadIfFull(id: number) {
      if (this.fullMembers[id]) {
        //await context.dispatch("fetchMemberById", { full: true, params: { id } });
      }
    },
    async ensureMembersOfGuild({
      guildId,
      full = true,
    }: {
      guildId: number;
      full?: boolean;
    }) {
      const guildStore = useGuildStore();
      await guildStore.ensureGuild(guildId, true);
      const guild = guildStore.getGuildById(guildId);
      let membersId: number[] =
        guild.guild_membership?.map((mp: GuildMembership) => mp.member_id) ||
        [];
      if (full) {
        membersId = membersId.filter((id: number) => !this.fullMembers[id]);
      } else {
        membersId = membersId.filter((id: number) => !this.members[id]);
      }
      if (membersId.length > 0) {
        /*await context.dispatch("fetchMemberById", {
          full,
          params: { id: membersId },
        });*/
      }
    },
    async ensurePlayersOfQuest(questId: number, full: boolean = true) {
      const questStore = useQuestStore();
      await questStore.ensureQuest({
        quest_id: questId,
        full: true,
      });
      const quest = questStore.getQuestById(questId);
      let membersId: number[] =
        quest.casting?.map((mp: Casting) => mp.member_id) || [];
      membersId.concat(
        quest.quest_membership?.map((mp: QuestMembership) => mp.member_id) ||
          [],
      );
      membersId = [...new Set(membersId)];
      membersId = membersId.filter((id: number) => !this.members[id]);
      if (membersId.length > 0) {
        /*await context.dispatch("fetchMemberById", {
          full,
          params: { id: membersId },
        });
        */
      }
    },
    resetMembers() {
      Object.assign(this, baseState);
    },
  },
});
/*
export const members = (axios: AxiosInstance) =>
  new MyVapi<MembersState>({
    axios,
    state: baseState as MembersState,
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
          let select = "*,casting_role!member_id(*)";
          if (MyVapi.store.state.member.isAuthenticated) {
            select += ",guild_member_available_role!member_id(*)";
          }
          Object.assign(params, { select });
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
      beforeRequest: (state: MembersState, actionParams) => {
        const { params, data } = actionParams;
        params.id = data.id;
        actionParams.data = filterKeys(data, memberPatchKeys);
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
          guildMemberAvailableRole: GuildMemberAvailableRole
        ) => {
          const member_id = guildMemberAvailableRole.member_id;
          let member = state.members[member_id];
          if (member) {
            const guild_member_available_role =
              member.guild_member_available_role?.filter(
                (a: GuildMemberAvailableRole) =>
                  a.role_id != guildMemberAvailableRole.role_id
              ) || [];
            guild_member_available_role.push(guildMemberAvailableRole);
            member = { ...member, guild_member_available_role };
            state.members = { ...state.members, [member_id]: member };
          }
        },
        REMOVE_GUILD_MEMBER_AVAILABLE_ROLE: (
          state: MembersState,
          guildMemberAvailableRole: GuildMemberAvailableRole
        ) => {
          const member_id = guildMemberAvailableRole.member_id;
          let member = state.members[member_id];
          if (member) {
            const guild_member_available_role =
              member.guild_member_available_role;
            const pos = guild_member_available_role.findIndex(
              (a: GuildMemberAvailableRole) =>
                a.role_id == guildMemberAvailableRole.role_id &&
                a.member_id == guildMemberAvailableRole.member_id &&
                a.guild_id == guildMemberAvailableRole.guild_id
            );
            if (pos >= 0) {
              guild_member_available_role.splice(pos, 1);
              member = { ...member, guild_member_available_role };
              state.members = { ...state.members, [member_id]: member };
            }
          }
        },
        ADD_CASTING_ROLE: (state: MembersState, castingRole) => {
          const member_id = castingRole.member_id;
          let member = state.members[member_id];
          if (member) {
            const casting_role =
              member.casting_role?.filter(
                (cr: CastingRole) => cr.role_id != castingRole.role_id
              ) || [];
            casting_role.push(castingRole);
            member = { ...member, casting_role };
            state.members = { ...state.members, [member_id]: member };
          }
        },
        REMOVE_CASTING_ROLE: (state: MembersState, castingRole) => {
          const member_id = castingRole.params.member_id;
          let member = state.members[member_id];
          if (member.casting_role.length > 0) {
            const casting_role = member.casting_role;
            const pos = casting_role.findIndex(
              (a: CastingRole) =>
                a.role_id == castingRole.params.role_id &&
                a.member_id == castingRole.params.member_id &&
                a.guild_id == castingRole.params.guild_id
            );
            if (pos >= 0) {
              casting_role.splice(pos, 1);
              member = { ...member, casting_role };
              state.members = { ...state.members, [member_id]: member };
            }
          }
        },
        CLEAR_STATE: (state: MembersState) => {
          Object.assign(state, baseState);
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
*/
