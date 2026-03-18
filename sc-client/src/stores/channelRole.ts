import { defineStore } from 'pinia';
import type { ChannelRole } from '../types';
import { AxiosResponse } from 'axios';
import { api } from '../boot/axios';
import { permission_enum } from '../enums';
import { useRoleStore } from './role';
import { useChannelStore } from './channel';
import { useBaseStore } from './baseStore';
import { useMemberStore } from './member';

export type ChannelRoles = ChannelRole[];

export interface ChannelRolesMap {
  [key: number]: ChannelRole[];
}

export interface ChannelRoleState {
  full: boolean;
  role?: ChannelRole | null;
  currentGuild?: number | null;
  currentQuest?: number | null;
  channelRolesMap: ChannelRolesMap;
  selectedRoles?: ChannelRole[] | null;
  loading?: boolean;
  error?: string | null;
}

export const useChannelRoleStore = defineStore('channelRoles', {
  state: (): ChannelRoleState => ({
    full: false,
    role: null,
    currentGuild: null,
    currentQuest: null,
    channelRolesMap: {},
    selectedRoles: null,
    loading: false,
    error: null,
  }),

  getters: {
    getRolesByQuestForGuild:
      (state) =>
      (questId: number, guildId?: number): ChannelRole[] => {
        const roles = state.channelRolesMap[questId] ?? [];
        return guildId ? roles.filter((r) => r.guild_id === guildId) : roles;
      },

    currentQuestRoles: (state) =>
      state.currentQuest ? state.channelRolesMap[state.currentQuest] || [] : [],
  },
  actions: {
    async ensureChannelRoles(guild_id: number) {
      if (guild_id != this.currentGuild || !this.full) {
        await this.fetchChannelRoles({ guild_id });
      }
    },

    async ensureChannelRole(
      role_id: number,
      guild_id: number,
      quest_id: number,
      member_id: number,
    ) {
      await this.ensureChannelRoles(guild_id);
      const existingRoles = this.getRolesByQuestForGuild(quest_id, guild_id);
      const existingRole = existingRoles.find((r) => r.role_id === role_id);

      if (existingRole) {
        return;
      }

      const baseStore = useBaseStore();
      const hasPermission = baseStore.hasPermission(
        permission_enum.createRoleChannel,
        guild_id,
        quest_id,
      );
      if (!hasPermission) {
        console.warn(
          `User does not have createRoleChannel permission for guild ${guild_id}, quest ${quest_id}`,
        );
        return;
      }

      const channelStore = useChannelStore();
      const roleStore = useRoleStore();

      const role = roleStore.getRoleById(role_id);
      if (!role) return;
      let channelId = null;
      const allChannels = Object.values(channelStore.channels);
      const existingChannel = allChannels.find(
        (c) =>
          c.quest_id === quest_id &&
          c.guild_id === guild_id &&
          c.title === role.name &&
          c.meta === 'channel',
      );

      if (!existingChannel) {
        const memberStore = useMemberStore();
        const creator_id = memberStore.getUserId;

        if (!creator_id) {
          console.error('Cannot create channel: no user ID');
          return;
        }

        const channelData = {
          title: role.name,
          node_type: 'channel' as const,
          meta: 'channel' as const,
          status: 'role_draft' as const,
          quest_id,
          guild_id,
          creator_id,
          draft_for_role_id: role_id,
          ancestry: '',
        };
        await channelStore.createChannelNode(channelData);
        const updatedChannels = Object.values(channelStore.channels);
        const newChannel = updatedChannels.find(
          (c) =>
            c.quest_id === quest_id &&
            c.guild_id === guild_id &&
            c.title === role.name &&
            c.meta === 'channel',
        );

        if (newChannel) {
          channelId = newChannel.id;
        }
      } else {
        channelId = existingChannel.id;
      }

      if (channelId) {
        const channelRoleData = {
          node_id: channelId,
          role_id,
          guild_id,
          quest_id,
          member_id,
        };
        await this.createChannelRole(channelRoleData);
      }
    },

    addOrUpdateRole(role: ChannelRole) {
      const qid = role.quest_id;
      if (!this.channelRolesMap[qid]) this.channelRolesMap[qid] = [];

      const existingIndex = this.channelRolesMap[qid].findIndex(
        (r) => r.id === role.id,
      );

      if (existingIndex >= 0) {
        this.channelRolesMap[qid][existingIndex] = role;
      } else {
        this.channelRolesMap[qid].push(role);
      }
    },
    clear() {
      this.full = false;
      this.role = null;
      this.currentGuild = null;
      this.currentQuest = null;
      this.channelRolesMap = {};
      this.selectedRoles = null;
      this.loading = false;
      this.error = null;
    },

    async fetchChannelRoles(params: { guild_id: number; quest_id?: number }) {
      const queryParams: any = {
        guild_id: `eq.${params.guild_id}`,
      };

      if (params.quest_id) {
        queryParams.quest_id = `eq.${params.quest_id}`;
      }

      const res: AxiosResponse<ChannelRole[]> = await api.get(
        '/channel_roles',
        {
          params: queryParams,
        },
      );
      if (res.status === 200) {
        this.currentGuild = params.guild_id;
        this.full = true;
        console.log('Fetched channel roles:', res.data.length, res.data);
        res.data.forEach((role) => {
          this.addOrUpdateRole(role);
        });
      }
    },
    async createChannelRole(data: Partial<ChannelRole>) {
      try {
        const res: AxiosResponse<ChannelRole[]> = await api.post(
          '/channel_roles',
          data,
        );
        if (res.status === 201) {
          const role = res.data[0];
          this.addOrUpdateRole(role);
          return role;
        }
      } catch (error: any) {
        if (
          error.response?.status === 409 &&
          error.response?.data?.code === '23505'
        ) {
          console.log(
            `Channel role already exists for node_id ${data.node_id}, role_id ${data.role_id}`,
          );
          return null;
        }
        throw error;
      }
      return null;
    },
  },
});
