import { defineStore } from 'pinia';
import { AxiosResponse } from 'axios';
import { Member, CastingRole, memberPatchKeys } from '../types';
import { getWSClient } from "../wsclient";
import { useBaseStore, filterKeys } from './baseStore';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { api, token_store, TOKEN_EXPIRATION } from '../boot/axios';
import { useMembersStore } from './members';

export interface MemberState {
  member: Member;
  token?: string;
  tokenExpiry?: number;
  isAuthenticated: boolean;
}

const TOKEN_RENEWAL = (TOKEN_EXPIRATION * 9) / 10;

const baseState: MemberState = {
  member: null,
  isAuthenticated: false,
  token: null,
  tokenExpiry: null,
};

export const useMemberStore = defineStore('member', {
  state: () => baseState,

  getters: {
    getUser: (state: MemberState) => state.member,
    getUserId: (state: MemberState) => state.member?.id,
    getMembersAvailableRoles: (state: MemberState) =>
      state.member?.guild_member_available_role,
    tokenIsValid: () => token_store.tokenIsValid(),
    getUserById: (state: MemberState) => (id: number) =>
      state.member?.id == id ? state.member : null,
    getCastingRoles: (state: MemberState) => state.member?.casting_role,
    castingPerQuest: (state: MemberState) =>
      Object.fromEntries(
        (state.member?.casting || []).map((c) => [c.quest_id, c]),
      ),
    guildPerQuest: (state: MemberState) =>
      Object.fromEntries(
        (state.member?.casting || []).map((c) => [c.quest_id, c.guild_id]),
      ),
    castingRolesForQuest: (state: MemberState) => (questId: number) => {
      return state.member?.casting_role.filter(
        (role) => role.quest_id == questId,
      );
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
    async logout() {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("tokenExpiry");
      // legacy
      window.localStorage.removeItem("email");
      getWSClient().logout();
      useBaseStore().reset();
    },
    async signin(mail: string, pass: string): Promise<string | undefined> {
      const res: AxiosResponse<string> = await api.post('/rpc/get_token', {
        mail,
        pass,
      });
      if (res.status == 200) {
        this.token = res.data;
        this.tokenExpiry = Date.now() + TOKEN_EXPIRATION;
        this.isAuthenticated = true;
        const storage = window.localStorage;
        storage.setItem('token', this.token);
        storage.setItem('tokenExpiry', this.tokenExpiry.toString());
        window.setTimeout(() => {
          this.renewToken();
        }, TOKEN_RENEWAL);
        await this.fetchLoginUser();
        return res.data;
      }
    },
    async registerUser(data: Member): Promise<Member> {
      // const password = await hash(data.password, 10);
      // data = { ...data, password };
      return await this.registerUserCrypted(data);
    },

    async ensureLoginUser(): Promise<Member> {
      // TODO: the case where the member is pending
      if (!this.member) {
        const expiry =
          this.tokenExpiry || window.localStorage.getItem('tokenExpiry');
        if (expiry && Date.now() < Number.parseInt(expiry)) {
          this.fetchLoginUser();
          if (!this.tokenExpiry) {
            // add a commit for expiry?
          }
          return this.member;
        }
      }
    },
    resetMember() {
      token_store.clearToken();
      this.isAuthenticated = false;
      Object.assign(this, baseState);
    },

    //Axios calls
    async fetchLoginUser(): Promise<Member | undefined> {
      const token = token_store.getToken();
      if (!token) {
        return undefined;
      }
      const token_payload = jwtDecode<JwtPayload>(token); //jwtDecode(token);
      const parts: string[] = token_payload.role.split('_');
      const role = parts[parts.length - 1];
      const res: AxiosResponse<Member[]> = await api.get('/members', {
        params: {
          id: `eq.${role}`,
          select:
            '*,quest_membership!member_id(*),guild_membership!member_id(*),casting!member_id(*),casting_role!member_id(*),guild_member_available_role!member_id(*)',
        },
      });
      if (res.status == 200) {
        this.member = res.data[0];
        this.isAuthenticated = true;
      } else {
        this.resetMember();
        console.error(res.status);
        console.error(res.data);
      }
      return this.member;
    },
    async renewToken(): string {
      const token = token_store.getToken();
      if (!token) return;
      const res: AxiosResponse<string> = await api.post('/rpc/renew_token', {
        token,
      });
      if (res.status == 200) {
        if (res.data) {
          token_store.setToken(res.data);
          window.setTimeout(() => {
            this.renewToken();
          }, TOKEN_RENEWAL);
        } else {
          Object.assign(this, baseState);
          token_store.clearToken();
          console.log('Renewal failed.');
        }
      } else {
        Object.assign(this, baseState);
        token_store.clearToken();
        console.error(res.data);
      }
    },
    async sendConfirmEmail(): boolean {
      await api.post('/rpc/send_login_email', {
        email: string,
      });
    },
    async registerUserCrypted(): Partial<Member> {
      const membersStore = useMembersStore();
      const res: AxiosResponse<Member> = await api.post('/rpc/create_member', {
        member,
      });
      if (res.status == 200) {
        membersStore.ensureMemberById({
          id: res.data,
          full: false,
        });
      }
    },
    async updateUser(data: Partial<Member>): Promise<Member> {
      data = filterKeys(data, memberPatchKeys);
      const params = {
        id: `eq.${data.id}`,
      };
      const res: AxiosResponse<Member[]> = await api.patch('/members', data, {
        params,
      });
      this.member = Object.assign({}, this.member, res.data[0]);
      return this.member;
    },

    removeCastingRole(castingRole: CastingRole) {
      if (
        this.member &&
        this.member.casting_role !== undefined &&
        this.member.casting_role.length > 0 &&
        this.member.id == castingRole.member_id
      ) {
        const casting_role = this.member.casting_role;
        const pos = casting_role.findIndex(
          (a: CastingRole) =>
            a.role_id == castingRole.role_id &&
            a.member_id == castingRole.member_id &&
            a.guild_id == castingRole.guild_id,
        );
        if (pos >= 0) {
          casting_role.splice(pos, 1);
          this.member = { ...this.member, casting_role };
        }
      }
    },
  },
});

/*    // Step 4
      mutations: {
      
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
*/
