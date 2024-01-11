import { defineStore } from 'pinia'

import { AxiosResponse, AxiosInstance } from 'axios';
import { Member } from '../types';
//import { getWSClient } from "../wsclient";
//import { decode } from "jws";

export interface MemberState {
  member: Member;
  token?: string;
  tokenExpiry?: number;
  isAuthenticated: boolean;
}

// TODO: right now expiry is shared knowledge with backend.
// Ideally, I should read it from the token.
export const TOKEN_EXPIRATION = 1000000;
const TOKEN_RENEWAL = (TOKEN_EXPIRATION * 9) / 10;

const baseState: MemberState = {
  member: null,
  token: null,
  tokenExpiry: null,
  isAuthenticated: false,
};

export const useMemberStore = defineStore('member',  { 
  state: (): State => {  
    return { baseState }
  }, 
  getters: {
    getUser: (state: MemberState) => state.member,
    getUserId: (state: MemberState) => state.member?.id,
    getMembersAvailableRoles: (state: MemberState) =>
      state.member?.guild_member_available_role,
      tokenIsValid: (state: MemberState) =>
      state.token && state.tokenExpiry && state.tokenExpiry > Date.now(),
    getUserById: (state: MemberState) => (id: number) =>
      state.member?.id == id ? state.member : null,
    getCastingRoles: (state: MemberState) => state.member?.casting_role,
      castingPerQuest: (state: MemberState) =>
      Object.fromEntries((state.member?.casting || []).map((c) => [c.quest_id, c])),
    guildPerQuest: (state: MemberState) =>
    Object.fromEntries((state.member?.casting || []).map((c) => [c.quest_id, c.guild_id])
    ),
    castingRolesForQuest: (state: MemberState) => (questId: number) => {
      return state.member?.casting_role.filter((role) => role.quest_id == questId);
    },
    castingRolesPerQuest: (state: MemberState) => {
      const castingRolesPerQuest: { [id: number]: CastingRole[] } = {};
      state.member?.casting_role?.forEach((cr) => {
      if (!castingRolesPerQuest[cr.quest_id]) {
        castingRolesPerQuest[cr.quest_id] = [];
      }
      castingRolesPerQuest[cr.quest_id].push(cr);
    });
      return castingRolesPerQuest;
    },
  },
  actions: {
    logout: async (context) => {
    context.commit('LOGOUT');
    getWSClient().logout();
    await MyVapi.store.dispatch('reset');
    },
    registerUser: async (context, data) => {
      // const password = await hash(data.password, 10);
      // data = { ...data, password };
      return await context.dispatch('registerUserCrypted', { data });
    },
    ensureLoginUser: async (context) => {
      // TODO: the case where the member is pending
      if (!context.state.member) {
        const expiry = context.state.tokenExpiry || window.localStorage.getItem('tokenExpiry');
      if (expiry && Date.now() < Number.parseInt(expiry)) {
        await context.dispatch('fetchLoginUser');
        if (!context.state.tokenExpiry) {
          // add a commit for expiry?
        }
        return context.state.member;
        }
      }
    },
    resetMember: (context) => {
      context.commit('CLEAR_STATE');
    },
  }
})

export const member = (axios: AxiosInstance) =>
  new MyVapi<MemberState>({
    axios,
    state: baseState,
  })
    // Step 3
    .patch({
      action: 'updateUser',
      property: 'member',
      path: ({ id }) => `/members?id=eq.${id}`,
      beforeRequest: (state: MemberState, actionParams) => {
        const { params, data } = actionParams;
        params.id = data.id;
        actionParams.data = filterKeys(data, memberPatchKeys);
      },
      onSuccess: (
        state: MemberState,
        res: AxiosResponse<Member[]>,
      ) => {
        state.member = Object.assign({}, state.member, res.data[0]);
      },
    })
    .call({
      action: 'signin',
      property: 'token',
      path: 'get_token',
      onSuccess: (
        state: MemberState,
        res: AxiosResponse<string>,
      
      ) => {
        state.token = res.data;
        state.tokenExpiry = Date.now() + TOKEN_EXPIRATION;
        state.isAuthenticated = true;
        const storage = window.localStorage;
        storage.setItem('token', state.token);
        storage.setItem('tokenExpiry', state.tokenExpiry.toString());
        window.setTimeout(() => {
          MyVapi.store.dispatch('member/renewToken', {
            data: { token: state.token },
          });
        }, TOKEN_RENEWAL);
        // Ideally, I should be able to chain another action as below.
        // But onSuccess is part of the mutator, not the action, so no async.
        // return await MyVapi.store.dispatch('member/fetchLoginUser')
      },
    })
    .get({
      action: 'fetchLoginUser',
      property: 'member',
      path: '/members',
      queryParams: true,
      beforeRequest: (state: MemberState, { params }) => {
        if (!state.token) {
          state.token = window.localStorage.getItem('token');
        }
        if (!state.tokenExpiry) {
          state.tokenExpiry = Number.parseInt(
            window.localStorage.getItem('tokenExpiry')
          );
        }
        const token_payload = decode(state.token).payload;
        const payload =
          typeof token_payload == 'string'
            ? JSON.parse(token_payload)
            : token_payload;
        const parts: string[] = payload.role.split('_');
        const role = parts[parts.length - 1];
        params.id = `eq.${role}`;
        params.select =
          '*,quest_membership!member_id(*),guild_membership!member_id(*),casting!member_id(*),casting_role!member_id(*),guild_member_available_role!member_id(*)';
      },
      onSuccess: (
        state: MemberState,
        res: AxiosResponse<Member>,
      ) => {
        state.member = res.data[0];
        state.isAuthenticated = true;
        state.token = state.token || window.localStorage.getItem('token');
        const tokenExpiry =
          state.tokenExpiry || window.localStorage.getItem('tokenExpiry');
        if (tokenExpiry) {
          state.tokenExpiry = Number.parseInt(tokenExpiry as string);
        }
        getWSClient().login(state.member.id, state.token);
        return state.member;
      },
      onError: (
        state: MemberState,
        error,
      ) => {
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('tokenExpiry');
        console.log(error);
      },
    })
    .call({
      action: 'registerUserCrypted',
      property: 'member',
      path: 'create_member',
      onError: (
        state: MemberState,
        error,
      ) => {
        if (data.code == 409) throw new Error('EXISTS');
        else throw error;
      },
      onSuccess: (
        state: MemberState,
        res: AxiosResponse<number>,
      ) => {
        // TODO: Send email to user with activation link
        // TODO: Add to members state?
        MyVapi.store.dispatch('members/ensureMemberById', {
          id: res.data,
          full: false,
        });
      },
    })
    .call({
      action: 'sendConfirmEmail',
      path: 'send_login_email',
    })
    .call({
      action: 'renewToken',
      path: 'renew_token',
      onError: (
        state: MemberState,
        error,
      ) => {
        Object.assign(state, baseState);
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('tokenExpiry');
        console.log(error);
      },
      onSuccess: (
        state: MemberState,
        res: AxiosResponse<string>,
      ) => {
        if (res.data) {
          state.token = res.data;
          if (state.member) getWSClient().login(state.member.id, state.token);
          const tokenExpiry = Date.now() + TOKEN_EXPIRATION;
          state.tokenExpiry = tokenExpiry;
          const storage = window.localStorage;
          storage.setItem('token', state.token);
          storage.setItem('tokenExpiry', tokenExpiry.toString());
          window.setTimeout(() => {
            MyVapi.store.dispatch('member/renewToken', {
              data: { token: state.token },
            });
          }, TOKEN_RENEWAL);
        } else {
          Object.assign(state, baseState);
          window.localStorage.removeItem('token');
          window.localStorage.removeItem('tokenExpiry');
          console.log('Renewal failed.');
        }
      },
    })

/*    // Step 4
    .getVuexStore({
      getters: MemberGetters,
      actions: MemberActions,
      mutations: {
        LOGOUT: (state: MemberState) => {
          window.localStorage.removeItem("token");
          window.localStorage.removeItem("tokenExpiry");
          // legacy
          window.localStorage.removeItem("email");
          return Object.assign(state, baseState);
        },
        ADD_CASTING: (state: MemberState, casting) => {
          if (state.member) {
            const castings =
              state.member.casting.filter(
                (c: Casting) => c.quest_id != casting.quest_id
              ) || [];
            castings.push(casting);
            state.member.casting = castings;
          }
        },
        ADD_CASTING_ROLE: (state: MemberState, casting_role) => {
          if (state.member) {
            const castingRoles =
              state.member.casting_role.filter(
                (cr: CastingRole) => cr.role_id != casting_role.role_id
              ) || [];
            castingRoles.push(casting_role);
            state.member.casting_role = castingRoles;
          }
        },
        REMOVE_CASTING_ROLE: (state: MemberState, castingRole) => {
          if (state.member) {
            const casting_role = state.member.casting_role;
            const pos = casting_role.findIndex(
              (a: CastingRole) =>
                a.role_id == castingRole.role_id &&
                a.member_id == castingRole.member_id &&
                a.guild_id == castingRole.guild_id
            );
            casting_role.splice(pos, 1);
            state.member = { ...state.member, casting_role };
          }
        },
        ADD_GUILD_MEMBER_AVAILABLE_ROLE: (
          state: MemberState,
          guild_Member_Available_Role: GuildMemberAvailableRole
        ) => {
          if (state.member) {
            const guildMemberAvailableRoles =
              state.member.guild_member_available_role.filter(
                (a: GuildMemberAvailableRole) =>
                  a.role_id != guild_Member_Available_Role.role_id
              ) || [];
            guildMemberAvailableRoles.push(guild_Member_Available_Role);
            state.member.guild_member_available_role =
              guildMemberAvailableRoles;
          }
        },
        REMOVE_GUILD_MEMBER_AVAILABLE_ROLE: (
          state: MemberState,
          guild_Member_Available_Role: GuildMemberAvailableRole
        ) => {
          if (state.member) {
            const guild_member_available_role =
              state.member.guild_member_available_role;
            const pos = guild_member_available_role.findIndex(
              (a: GuildMemberAvailableRole) =>
                a.role_id == guild_Member_Available_Role.role_id &&
                a.member_id == guild_Member_Available_Role.member_id &&
                a.guild_id == guild_Member_Available_Role.guild_id
            );
            guild_member_available_role.splice(pos, 1);
            state.member = { ...state.member, guild_member_available_role };
          }
        },
        ADD_GUILD_MEMBERSHIP: (state: MemberState, membership) => {
          if (state.member) {
            const memberships =
              state.member.guild_membership.filter(
                (m: GuildMembership) => m.guild_id != membership.guild_id
              ) || [];
            memberships.push(membership);
            state.member.guild_membership = memberships;
          }
        },
        ADD_QUEST_MEMBERSHIP: (state: MemberState, membership) => {
          if (state.member) {
            const memberships =
              state.member.quest_membership.filter(
                (m: QuestMembership) => m.quest_id != membership.quest_id
              ) || [];
            memberships.push(membership);
            state.member.quest_membership = memberships;
          }
        },
        CLEAR_STATE: (state: MemberState) => {
          Object.assign(state, baseState);
        },
      },
    });

type MemberRestActionTypes = {
  updateUser: RestDataActionType<Partial<Member>, Member[]>;
  signin: RestDataActionType<{ mail: string; pass: string }, string>;
  fetchLoginUser: RestEmptyActionType<Member[]>;
  registerUserCrypted: RestDataActionType<Partial<Member>, Member[]>;
  renewToken: RestDataActionType<{ token: string }, string>;
  confirmToken: RestDataActionType<{ token: string }, string>;
  sendConfirmEmail: RestDataActionType<{ email: string }, boolean>;
};

export type MemberActionTypes = RetypeActionTypes<typeof MemberActions> &
  MemberRestActionTypes;
export type MemberGetterTypes = RetypeGetterTypes<typeof MemberGetters>;
*/