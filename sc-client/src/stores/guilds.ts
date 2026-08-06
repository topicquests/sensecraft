import {
  GuildData,
  Guild,
  GuildMembership,
  GamePlay,
  PublicMember,
  QuestData,
  GuildMemberAvailableRole,
  guildPatchKeys,
} from '../types';
import { registration_status_enum, game_play_status_enum } from '../enums';
import { defineStore } from 'pinia';
import { useMemberStore } from './member';
import { useMembersStore } from './members';
import { useQuestStore } from './quests';
import { api } from '../boot/axios';
import axios, { AxiosResponse } from 'axios';
import { getWSClient } from '../wsclient';
import { filterKeys } from './baseStore';

interface GuildMap {
  [key: number]: GuildData;
}
export interface GuildsState {
  guilds: GuildMap;
  currentGuild: number | undefined;
  fullFetch: boolean;
  fullGuilds: { [key: number]: boolean };
}

const clearBaseState: GuildsState = {
  currentGuild: undefined,
  guilds: {},
  fullFetch: false,
  fullGuilds: {},
};
export const useGuildStore = defineStore('guild', {
  state: (): GuildsState => ({
    currentGuild: undefined,
    guilds: {},
    fullFetch: false,
    fullGuilds: {},
  }),

  getters: {
    getCurrentGuild: (state: GuildsState): GuildData | undefined => {
      if (typeof state.currentGuild === 'number') {
        return state.guilds[state.currentGuild];
      } else {
        return undefined;
      }
    },
    getGuilds: (state: GuildsState): GuildData[] => Object.values(state.guilds),
    getGuildById: (state: GuildsState) => (id: number) => state.guilds[id],
    getMyGuilds: (state: GuildsState): GuildData[] => {
      const memberId = useMemberStore().getUserId;
      return Object.values(state.guilds).filter((guild: GuildData) =>
        guild?.guild_membership?.find(
          (m: GuildMembership) =>
            m.member_id == memberId &&
            m.status == registration_status_enum.confirmed,
        ),
      );
    },
    isGuildMember:
      (state: GuildsState) =>
      (guild_id: number): Partial<GuildMembership> | undefined => {
        const memberId = useMemberStore().getUserId;
        const guild = state.guilds[guild_id];
        if (!guild) return undefined;
        return guild.guild_membership?.find(
          (m: Partial<GuildMembership>) =>
            m.member_id == memberId &&
            m.status == registration_status_enum.confirmed,
        );
      },
    getGuildMembershipById: (state: GuildsState) => (member_id: number) => {
      if (state.currentGuild) {
        const guildId: number | boolean = state.currentGuild;
        if (typeof guildId === 'number')
          return state.guilds[guildId]?.guild_membership?.find(
            (m: GuildMembership) =>
              m.member_id == member_id && m.guild_id == guildId,
          );
      }
    },
    getMembersOfCurrentGuild: (
      state: GuildsState,
    ): PublicMember[] | undefined => {
      if (typeof state.currentGuild === 'number') {
        const guild: GuildData | undefined = state.currentGuild
          ? state.guilds[state.currentGuild]
          : undefined;
        const membersStore = useMembersStore();

        return guild?.guild_membership
          ?.map((gm: GuildMembership) => membersStore.members[gm.member_id])
          .filter((member: PublicMember) => member);
      } else return [];
    },
    getGuildsPlayingCurrentQuest: (
      state: GuildsState,
    ): GuildData[] | undefined => {
      const questStore = useQuestStore();
      const quest: QuestData | undefined = questStore.getCurrentQuest;
      if (!quest) return [];
      const guildId: (number | null)[] | undefined = quest.game_play?.map(
        (gp: GamePlay) =>
          gp.game_status != game_play_status_enum.cancelled
            ? gp.guild_id
            : null,
      );
      if (guildId == undefined) return [];
      return Object.values(state.guilds).filter((guild: GuildData) =>
        guildId.includes(guild.id),
      );
    },
  },
  actions: {
    async ensureAllGuilds(): Promise<Partial<Guild>> {
      if (Object.keys(this.guilds).length === 0 || !this.fullFetch) {
        await this.fetchGuildsById(undefined, false);
      }
      return this.guilds;
    },

    setCurrentGuild(guild_id: number | boolean) {
      if (typeof guild_id === 'number') {
        this.currentGuild = guild_id;
      }
      getWSClient().setDefaultGuild(guild_id);
    },
    async ensureGuild(guild_id: number, full: boolean | undefined = true) {
      if (
        this.getGuildById(guild_id) === undefined ||
        (full && !this.fullGuilds[guild_id])
      ) {
        await this.fetchGuildsById(guild_id, full);
      }
    },
    async createGuild(
      data: Partial<Guild>,
    ): Promise<AxiosResponse<GuildData[]>> {
      const res: AxiosResponse<GuildData[]> = await this.createGuildBase(data);
      // Refetch to get memberships.
      // TODO: maybe add representation to creation instead?
      const guild = res.data[0];
      const guild_id = guild.id;
      await this.fetchGuildsById(guild_id);
      // TODO: Get the membership from the guild
      await useMemberStore().fetchLoginUser();
      const params = {
        member_id: guild.creator,
        guild_id: guild_id,
        role_id: guild.default_role_id,
      };

      await this.addGuildMemberAvailableRole(params);
      return res;
    },
    async ensureCurrentGuild(guild_id: number, full: boolean = true) {
      await this.ensureGuild(guild_id, full);
      this.setCurrentGuild(guild_id);
    },
    async ensureGuildsPlayingQuest({
      quest_id,
      full,
    }: {
      quest_id: number;
      full?: boolean;
    }) {
      const questStore = useQuestStore();
      await questStore.ensureQuest({
        quest_id,
        full: true,
      });
      const quest = questStore.getQuestById(quest_id);
      let guildId: number[] | undefined = quest.game_play?.map(
        (gp: GamePlay) => gp.guild_id,
      );
      if (guildId == undefined) return [];
      if (full) {
        guildId = guildId.filter((id: number) => !this.fullGuilds[id]);
      } else {
        guildId = guildId.filter((id: number) => !this.guilds[id]);
      }
      if (guildId.length > 0) {
        const guildParam = guildId.length == 1 ? guildId[0] : guildId;
        await this.fetchGuildsById(guildParam, full);
      }
    },
    async addGuildMembership(membership: Partial<GuildMembership>) {
      const membersStore = useMembersStore();
      const memberStore = useMemberStore();
      await this.doAddGuildMembership(membership);
      if (this.guilds) {
        if (typeof membership.guild_id === 'number') {
          const gMembership: GuildMembership | undefined = this.guilds[
            membership.guild_id
          ].guild_membership!.find(
            (c: GuildMembership) => c.member_id == membership.member_id,
          );
          if (gMembership?.status == 'confirmed') {
            await membersStore.fetchMemberById(membership.member_id, true);
            if (memberStore.getUserId) {
              if (membership.member_id == memberStore.getUserId) {
                await memberStore.fetchLoginUser();
              }
            }
          }
        }
      }
    },
    async updateGuildMembership(membership: Partial<GuildMembership>) {
      const membersStore = useMembersStore();
      await this.doUpdateGuildMembership(membership);
      if (typeof membership.guild_id === 'number') {
        const gMembership: GuildMembership | undefined = this.guilds[
          membership.guild_id
        ].guild_membership!.find(
          (c: GuildMembership) => c.member_id == membership.member_id,
        );
        if (gMembership?.status == 'confirmed') {
          await membersStore.reloadIfFull(membership.member_id!);
          if (membership.member_id == useMemberStore().getUserId) {
            await useMemberStore().fetchLoginUser();
          }
        }
      }
    },
    resetGuilds() {
      Object.assign(this, clearBaseState);
    },
    async fetchGuildsById(
      id: number | number[] | undefined,
      full: boolean = true,
    ): Promise<GuildData[]> {
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
        params.select =
          '*,guild_membership!guild_id(*),casting!guild_id(*),game_play!guild_id(*)';
        if (!full) {
          Object.assign(params, {
            'guild_membership.member_id': `eq.${userId}`,
            'casting.member_id': `eq.${userId}`,
          });
        }
      } else {
        params.select = '*,game_play!guild_id(*)';
      }
      const res: AxiosResponse<GuildData[]> = await api.get('/guilds_data', {
        params,
      });
      if (res.status == 200) {
        const guilds = Object.fromEntries(
          res.data.map((guild: GuildData) => [guild.id, guild]),
        );
        if (!full) {
          for (const guild of Object.values(
            this.guilds as Record<string, GuildData>,
          )) {
            if (!this.fullGuilds[guild.id]) {
              continue;
            }
            if (guild.casting) {
              guilds[guild.id].casting = guild.casting;
            }
            if (guild.guild_membership) {
              guilds[guild.id].guild_membership = guild.guild_membership;
            }
          }
        } else {
          this.fullGuilds = {
            ...this.fullGuilds,
            ...Object.fromEntries(
              res.data.map((guild: GuildData) => [guild.id, true]),
            ),
          };
        }
        this.guilds = {
          ...this.guilds,
          ...guilds,
        };
        this.fullFetch = id === undefined;
        return res.data;
      }
      return [];
    },
    async createGuildBase(
      data: Partial<Guild>,
    ): Promise<AxiosResponse<GuildData[]>> {
      try {
        const res: AxiosResponse<GuildData[]> = await api.post('/guilds', data);
        if (res.status == 201) {
          const guildData: GuildData = Object.assign(res.data[0], {
            member_count: 1,
            member_request_count: 0,
            is_member: true,
            is_admin: true,
            last_node_published_at: '',
            node_count: 0,
            ongoing_quests_count: 0,
            finished_quests_count: 0,
            recruiting_for_quest_count: 0,
          });
          this.guilds = { ...this.guilds, [guildData.id]: guildData };
          this.fullGuilds = { ...this.fullGuilds, [guildData.id]: false };
          // TODO: update memberships in member.
        }
        return res;
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error('Guild creation failed:', error);
          throw new Error(
            `Request failed with status code ${error.response?.status || 500}`,
          );
        } else {
          console.error('Unexpected error', error);
          throw error;
        }
      }
      throw new Error('Guild creation failed: No response returned');
    },
    async registerAllMembers(guildId: number, questId: number) {
      await api.post('/rpc/register_all_members', {
        questId,
        guildId,
      });
    },
    async updateGuild(data: Partial<Guild>) {
      try {
        data = filterKeys(data, guildPatchKeys);
        const res: AxiosResponse<Partial<GuildData[]>> = await api.patch(
          'guilds',
          data,
          {
            params: { id: `eq.${data.id}` },
          },
        );
        if (res.status == 200) {
          const guild = res.data[0];
          const guildData: GuildData = Object.assign(
            {},
            this.guilds[guild!.id],
            guild,
          );
          this.guilds = { ...this.guilds, [guild!.id]: guildData };
        }
      } catch (error) {
        console.error('Guild update failed:', error);
        if (axios.isAxiosError(error)) {
          throw new Error(
            `Request failed with status code ${error.response?.status || 500}`,
          );
        } else {
          throw error;
        }
      }
    },
    async doAddGuildMembership(data: Partial<GuildMembership>) {
      try {
        const res: AxiosResponse<GuildMembership[]> = await api.post(
          'guild_membership',
          data,
        );
        if (res.status == 201) {
          const membership = res.data[0];
          const guild = this.guilds[membership.guild_id];
          if (guild) {
            const memberships = guild.guild_membership || [];
            memberships.push(membership);
            guild.guild_membership = memberships;
          }
        }
      } catch (error) {
        console.error('Add guildMembership failed:', error);
        if (axios.isAxiosError(error)) {
          throw new Error(
            `Request failed with status code ${error.response?.status || 500}`,
          );
        } else {
          throw error;
        }
      }
    },
    async doUpdateGuildMembership(data: Partial<GuildMembership>) {
      try {
        const memberStore = useMemberStore();
        const res: AxiosResponse<GuildMembership[]> = await api.patch(
          'guild_membership',
          data,
          {
            params: {
              member_id: `eq.${data.member_id}`,
              guild_id: `eq.${data.guild_id}`,
            },
          },
        );
        if (res.status == 200) {
          const membership = res.data[0];
          const guild = this.guilds[membership.guild_id];
          if (guild) {
            const memberships =
              guild.guild_membership?.filter(
                (gp: GuildMembership) => gp.member_id !== membership.member_id,
              ) || [];
            memberships.push(membership);
            guild.guild_membership = memberships;
          }
          if (memberStore.member && memberStore.member.guild_membership) {
            const memberships =
              memberStore.member.guild_membership.filter(
                (m: GuildMembership) => m.guild_id != membership.guild_id,
              ) || [];
            memberships.push(membership);
            memberStore.member.guild_membership = memberships;
          }
        }
      } catch (error) {
        console.error('Update guildMembership failed:', error);
        if (axios.isAxiosError(error)) {
          throw new Error(
            `Request failed with status code ${error.response?.status || 500}`,
          );
        } else {
          throw error;
        }
      }
    },
    async addGuildMemberAvailableRole(data: {
      member_id: number;
      guild_id: number;
      role_id: number | null | undefined;
    }) {
      try {
        const memberStore = useMemberStore();
        const membersStore = useMembersStore();
        const res: AxiosResponse<GuildMemberAvailableRole[]> = await api.post(
          '/guild_member_available_role',
          data,
        );
        if (res.status == 201) {
          const availableRole = res.data[0];
          if (memberStore.getUserId == availableRole.member_id)
            if (
              memberStore.member &&
              memberStore.member.guild_member_available_role
            ) {
              const guildMemberAvailableRoles =
                memberStore.member.guild_member_available_role.filter(
                  (a: GuildMemberAvailableRole) =>
                    a.role_id != availableRole.role_id,
                ) || [];
              guildMemberAvailableRoles.push(availableRole);
              memberStore.member.guild_member_available_role =
                guildMemberAvailableRoles;
            }
          const member_id = availableRole.member_id;
          let member = membersStore.members[member_id];
          if (member) {
            const guild_member_available_role =
              member.guild_member_available_role?.filter(
                (a: GuildMemberAvailableRole) =>
                  a.role_id != availableRole.role_id,
              ) || [];
            guild_member_available_role.push(availableRole);
            member = { ...member, guild_member_available_role };
            membersStore.members = {
              ...membersStore.members,
              [member_id]: member,
            };
          }
        }
      } catch (error) {
        console.error('Add guild member available role failed:', error);
        if (axios.isAxiosError(error)) {
          throw new Error(
            `Request failed with status code ${error.response?.status || 500}`,
          );
        } else {
          throw error;
        }
      }
    },
    async deleteGuildMemberAvailableRole(
      data: Partial<GuildMemberAvailableRole>,
    ) {
      const memberStore = useMemberStore();
      const membersStore = useMembersStore();
      const questStore = useQuestStore();
      const { member_id, guild_id, role_id } = data;
      const params = Object();
      params.member_id = `eq.${member_id}`;
      params.guild_id = `eq.${guild_id}`;
      params.role_id = `eq.${role_id}`;
      try {
        const res: AxiosResponse<GuildMemberAvailableRole[]> = await api.delete(
          '/guild_member_available_role',
          { params },
        );
        if (res.status == 200) {
          // Update the logged-in user's own member store if applicable
          if (memberStore.getUserId == member_id && memberStore.member) {
            const gmars = memberStore.member.guild_member_available_role;
            const pos =
              gmars?.findIndex(
                (a: GuildMemberAvailableRole) =>
                  a.role_id === role_id &&
                  a.member_id === member_id &&
                  a.guild_id === guild_id,
              ) ?? -1;
            if (pos >= 0) {
              const updated = [...gmars!];
              updated.splice(pos, 1);
              memberStore.member.guild_member_available_role = updated;
            }
          }

          // Update the affected member in the members store
          const member = membersStore.members[member_id!];
          if (member?.guild_member_available_role) {
            const pos = member.guild_member_available_role.findIndex(
              (a: GuildMemberAvailableRole) =>
                a.role_id == role_id &&
                a.member_id == member_id &&
                a.guild_id == guild_id,
            );
            if (pos >= 0) {
              const updated = [...member.guild_member_available_role];
              updated.splice(pos, 1);
              membersStore.members = {
                ...membersStore.members,
                [member_id!]: { ...member, guild_member_available_role: updated },
              };
            }
          }

          // Delete casting roles that used this available role
          const castingRoles = membersStore.members[
            member_id!
          ]?.casting_role?.filter(
            (cr) => cr.role_id == role_id && cr.guild_id == guild_id,
          );
          if (castingRoles?.length) {
            await Promise.all(
              castingRoles.map((element) =>
                questStore.deleteCastingRole(
                  element.member_id!,
                  element.guild_id,
                  element.role_id,
                  element.quest_id,
                ),
              ),
            );
          }
        }
      } catch (error) {
        console.error('Delete guild member available role failed:', error);
        if (axios.isAxiosError(error)) {
          throw new Error(
            `Request failed with status code ${error.response?.status || 500}`,
          );
        } else {
          throw error;
        }
      }
    },
  },
});
