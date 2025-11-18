import { defineStore } from 'pinia'
import type { ChannelRole } from '../types'
import { AxiosResponse } from 'axios'
import { api } from '../boot/axios'

export type ChannelRoles = ChannelRole[]

export interface ChannelRolesMap {
  [key: number]: ChannelRole[] 
}

export interface ChannelRoleState {
  full: boolean
  role?: ChannelRole | null
  currentGuild?: number | null
  currentQuest?: number | null
  channelRolesMap: ChannelRolesMap
  selectedRoles?: ChannelRole[] | null
  loading?: boolean
  error?: string | null
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
    error: null
  }),

  getters: {
    getRolesByQuestForGuild:(state) =>
        (questId: number, guildId?: number): ChannelRole[] => {
        const roles = state.channelRolesMap[questId] ?? []
        return guildId ? roles.filter(r => r.guild_id === guildId) : roles
    },

    currentQuestRoles: (state) =>
      state.currentQuest ? state.channelRolesMap[state.currentQuest] || [] : [],
  },
  actions: {
    async ensureChannelRoles(guild_id: number) {
        if (guild_id != this.currentGuild || !this.full) {
            await this.fetchChannelRoles( {guild_id});
        }
    },

    addOrUpdateRole(role: ChannelRole) {
      const qid = role.quest_id
      if (!this.channelRolesMap[qid]) this.channelRolesMap[qid] = []

      const existingIndex = this.channelRolesMap[qid].findIndex(
        (r) => r.id === role.id
      )

      if (existingIndex >= 0) {
        this.channelRolesMap[qid][existingIndex] = role
      } else {
        this.channelRolesMap[qid].push(role)
      }
    },
    clear() {
      this.full = false
      this.role = null
      this.currentGuild = null
      this.currentQuest = null
      this.channelRolesMap = {}
      this.selectedRoles = null
      this.loading = false
      this.error = null
    },

    async fetchChannelRoles (params: {guild_id: number}) {
        const res: AxiosResponse<ChannelRole[]> = await api.get(
            '/channel',
            {
                params: {
                    guild_id: 'eq.${params.guild_id'
                }
            }
        );
    },
    async createChannelRole(data: Partial<ChannelRole>) {
        const res: AxiosResponse<ChannelRole[]> = await api.post(
            '/channel_roles',
            data
        );
        if (res.status === 201) {
            const role = res.data[0]
            this.addOrUpdateRole(role)
        }
    },
  }
})
