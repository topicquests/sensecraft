import {
  GuildData,
  Guild,
  GuildMembership,
  GamePlay,
  PublicMember,
  Quest,
  QuestData,
  GuildMemberAvailableRole,
} from '../types';
import { registration_status_enum, game_play_status_enum } from '../enums';
import { defineStore } from 'pinia';
import { useMemberStore } from './member';
import { useMembersStore } from './members';
import { useQuestStore } from './quests';
import { api } from '../boot/axios';
import { AxiosResponse } from 'axios';
import { getWSClient } from '../wsclient';

interface GuildMap {
  [key: number]: GuildData;
};
export interface GuildsState {
  guilds: GuildMap;
  currentGuild: number;
  fullFetch: boolean;
  fullGuilds: { [key: number]: boolean };
};
const questStore = useQuestStore();
const baseState: GuildsState = {
  currentGuild:0,
  guilds: {},
  fullFetch: false,
  fullGuilds: {},
};
export const useGuildStore = defineStore('guild', {
  state: () => baseState,

getters: {
  getCurrentGuild: (state: GuildsState): GuildData => 
      state.guilds[state.currentGuild],
  getGuilds: (state: GuildsState) => Object.values(state.guilds),
  getGuildById: (state: GuildsState) => (id: number) => state.guilds[id],
  getMyGuilds: (state: GuildsState): GuildData[] => {
    const memberId = useMemberStore().getUserId;
      return Object.values(state.guilds).filter((guild: GuildData) =>
      guild?.guild_membership?.find(
        (m: GuildMembership) =>
         m.member_id == memberId &&
         m.status == registration_status_enum.confirmed,
      ),
    )
  },
  isGuildMember: (state: GuildsState) => (guild_id: number) => {
    const memberId = useMemberStore().getUserId;
    return state.guilds[guild_id].guild_membership?.find(
        (m: GuildMembership) =>
          m.member_id == memberId &&
          m.status == registration_status_enum.confirmed,
    );
  },
  getGuildMembershipById: (state: GuildsState) => (member_id: number) => {
    if (state.currentGuild) {
      const guildId: number = state.currentGuild;
      return state.guilds[guildId]?.guild_membership?.find(
        (m: GuildMembership) =>
          m.member_id == member_id && m.guild_id == guildId,
      );
    }
  },
  getMembersOfCurrentGuild: (state: GuildsState) => {
    const guild = state.currentGuild
      ? state.guilds[state.currentGuild]
      : undefined;
    const members = useMembersStore().members;
    return guild?.guild_membership
      ?.map((gm: GuildMembership) => members[gm.member_id])
      .filter((member: PublicMember) => member);
  },
  getGuildsPlayingCurrentQuest: (state: GuildsState) => {
    
    const quest: QuestData = questStore.getCurrentQuest;
      if (!quest) return [];
      const guildId = quest.game_play?.map((gp: GamePlay) =>
        gp.game_status != game_play_status_enum.cancelled ? gp.guild_id : null,
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
        await this.fetchGuilds();
      }
      return this.guilds;
    },
    setCurrentGuild(guild_id: number) {
      this.currentGuild = guild_id;
      //getWSClient().setDefaultGuild(guild_id);
    },
    async ensureGuild(
      guild_id: number,
      full: boolean | undefined = true,
    ) {
      if (
        this.getGuildById(guild_id) === undefined ||
        (full && !this.fullGuilds[guild_id])
      ) {
        await this.fetchGuildById({id:guild_id}, full);
      }
    },
    async createGuild(data: Partial<Guild>): Promise<AxiosResponse<GuildData[]>> {
      const res: AxiosResponse<GuildData[]>= await this.createGuildBase(data);
      // Refetch to get memberships.
      // TODO: maybe add representation to creation instead?
      const guild = res.data[0];
      const guild_id = guild.id;
      await this.fetchGuildById({id: guild_id});
      // TODO: Get the membership from the guild
      await useMemberStore().fetchLoginUser;
      const params = {
        member_id: guild.creator, 
        guild_id: guild_id, 
        role_id: guild.default_role_id
      };

      await this.addGuildMemberAvailableRole(
        params
      );
      return res;
    },
    async ensureCurrentGuild(guild_id: number, full: boolean = true) {
      await this.ensureGuild(guild_id, full);
      await this.setCurrentGuild(guild_id);
    },
    async ensureGuildsPlayingQuest({
      quest_id,
      full,
    }: {
      quest_id: number;
      full?: boolean;
    }) {
      await questStore.ensureQuest({
        quest_id,
        full: true,
      });
      const quest = questStore.getQuestById(quest_id);
      let guildId: number[] = quest.game_play?.map(
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
        await this.fetchGuilds(
          full,
          guildParam ,
        );
      }
    },
    async addGuildMembership(membership: Partial<GuildMembership>) {
      const membersStore = useMembersStore();
      const memberStore = useMemberStore();
      await this.doAddGuildMembership( membership );
      if(this.guilds) {
      const gMembership: GuildMembership|undefined = this.guilds[
        membership.guild_id
      ].guild_membership.find(
        (c: GuildMembership) => c.member_id == membership.member_id,
      );
      
      if (gMembership.status == 'confirmed') {
        await membersStore.fetchMemberById({
          full: true,
          params: { id: membership.member_id },
        });
        if (membership.member_id == memberStore.getUserId()) {
          await memberStore.fetchLoginUser();
        }
      }
    }
    },
    async updateGuildMembership(membership: Partial<GuildMembership>) {
      await this.doUpdateGuildMembership(membership);
      const gMembership: GuildMembership = this.guilds[
        membership.guild_id
      ].guild_membership.find(
        (c: GuildMembership) => c.member_id == membership.member_id,
      );
      if (gMembership.status == 'confirmed') {
        await useMembersStore().reloadIfFull(membership.member_id);
        if (membership.member_id == useMemberStore().getUserId) {
          await useMemberStore().fetchLoginUser();
        }
      }
    },
    resetGuilds() {
      Object.assign(this, baseState);
    },
    async fetchGuilds(
      full?: boolean,
      id?: number | Array<number>,
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
        Object.assign(params, {
          select:
            '*,guild_membership!guild_id(*),casting!guild_id(*),game_play!guild_id(*)',
          'guild_membership.member_id': `eq.${userId}`,
          'casting.member_id': `eq.${userId}`,
        });
      } else {
        params.select = '*,game_play!guild_id(*)';
      }
      const res: AxiosResponse<GuildData[]> = await api.get('/guilds_data', {
        params,
      });
      if (res.status == 200) {
        const fullGuilds: GuildData[] = Object.values<GuildData>(
          this.guilds,
        ).filter((guild: GuildData) => this.fullGuilds[guild.id]);

        const guilds = Object.fromEntries(
          res.data.map((guild: GuildData) => [guild.id, guild]),
        );
        for (const guild of fullGuilds) {
          if (guilds[guild.id]) {
            guilds[guild.id] = Object.assign(guilds[guild.id], {
              casting: guild.casting,
              guild_membership: guild.guild_membership,
            });
          } else {
            guilds[guild.id] = guild;
          }
        }
        this.guilds = guilds;
        this.fullFetch = true;
        return res.data;
      }
      return [];
    },
    async fetchGuildById(
      data:{id: number | Array<number>},
      full: boolean = true,
    ): Promise<AxiosResponse<GuildData[]>>{
      const params = Object.assign(data);

      if (Array.isArray(params.id)) {
        params.id = `in.(${params.id.join(",")})`;
      } else {
        params.id = `eq.${params.id}`;
      }
      const userId = useMemberStore().getUserId;
      if (userId) {
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
        this.guilds = {
          ...this.guilds,
          ...Object.fromEntries(
            res.data.map((guild: GuildData) => [guild.id, guild]),
          ),
        };
        if (full) {
          this.fullGuilds = {
            ...this.fullGuilds,
            ...Object.fromEntries(
              res.data.map((guild: GuildData) => [guild.id, true]),
            ),
          };
        }       
      }
      return res;
    },
    async createGuildBase(data: Partial<Guild>):  Promise<AxiosResponse<GuildData[]>>{
      const res: AxiosResponse<GuildData[]> = await api.post('/guilds', data);
      if (res.status == 201) {
        const guildData: GuildData = Object.assign(res.data[0], {
          member_count: 1,
          member_request_count: 0,
          is_member: true,
          is_admin: true,
          last_node_published_at: "",
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
    },
    async registerAllMembers({ guildId, questId  }) {
      await api.post('/rpc/register_all_members', {
        questId,
        guildId,
      });
    },
    //updateGuild: RestDataActionType<Partial<Guild>, Guild[]>;
    async updateGuild(data: Partial<Guild>) {
      const params = Object();
      params.id = data.id;
      //actionParams.data = filterKeys(data, guildPatchKeys);
      const res: AxiosResponse<Guild> = await api.patch('/guilds', {
        params,
      });
      if (res.status == 200) {
        const guild = res.data[0];
        const guildData: GuildData = Object.assign(
          this.guilds[guild.id],
          guild,
        );
        this.guilds = { ...this.guilds, [guild.id]: guildData };
      }
    },
    async doAddGuildMembership(data: Partial<GuildMembership>) {
      const res: AxiosResponse<GuildMembership[]> = await api.post(
        'guild_membership',
        {
          data,
        },
      );
      if (res.status == 200) {
        const membership = res.data[0];
        const guild = this.guilds[membership.guild_id];
        if (guild) {
          const memberships = guild.guild_membership || [];
          memberships.push(membership);
          guild.guild_membership = memberships;
        }
      }
    },
    async doUpdateGuildMembership(data: Partial<GuildMembership>) {
      const memberStore = useMemberStore();
      const params = Object();
      params.member_id = data.member_id;
      params.guild_id = data.guild_id;
      const res: AxiosResponse<GuildMembership[]> = await api.patch(
        'guild_membership',
        {
          params,
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
    },
    async addGuildMemberAvailableRole(data: { 
      member_id:number,
      guild_id: number,
      role_id: number|null|undefined}) {
      const memberStore = useMemberStore();
      const membersStore = useMembersStore();
      const res: AxiosResponse<GuildMemberAvailableRole[]> = await api.post(
        '/guild_member_available_role',
          data,
      );
      if (res.status == 200) {
        const availableRole = res.data[0];
        if (memberStore.getUserId == availableRole.member_id)
          if (memberStore.member && memberStore.member.guild_member_available_role) {
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
        membersStore.members = { ...membersStore.members, [member_id]: member };
      }
    }
    },
    async deleteGuildMemberAvailableRole(
      data: Partial<GuildMemberAvailableRole>,
    ) {
      const memberStore = useMemberStore();
      const membersStore = useMembersStore();
      const questStore = useQuestStore();
      const params = Object();
      params.member_id = data.member_id;
      params.guild_id = data.guild_id;
      params.role_id = data.role_id;
      const res: AxiosResponse<GuildMemberAvailableRole> = await api.delete(
        '/guild_member_available_role',
        {
          params,
        },
      );
      if (res.status == 200) {
        const availableRole = res.data[0];
        if (memberStore.getUserId == availableRole.member_id) {
          if (memberStore.member) {
            const guild_member_available_role =
              memberStore.member.guild_member_available_role;
            const pos = guild_member_available_role.findIndex(
              (a: GuildMemberAvailableRole) =>
                a.role_id == guild_Member_Available_Role.role_id &&
                a.member_id == guild_Member_Available_Role.member_id &&
                a.guild_id == guild_Member_Available_Role.guild_id,
            );
            guild_member_available_role.splice(pos, 1);
            memberStore.member = {
              ...memberStore.member,
              guild_member_available_role,
            };
          }
          const member_id = guildMemberAvailableRole.member_id;
          let member = membersStore.members[member_id];
          
            const guild_member_available_role =
              member.guild_member_available_role;
            if (member && guild_member_available_role) {
              const pos = guild_member_available_role.findIndex(
              (a: GuildMemberAvailableRole) =>
                a.role_id == memberStore.guildMemberAvailableRole.role_id &&
                a.member_id == guildMemberAvailableRole.member_id &&
                a.guild_id == guildMemberAvailableRole.guild_id,
            );
            if (pos >= 0) {
              guild_member_available_role.splice(pos, 1);
              member = { ...member, guild_member_available_role };
              membersStore.members = {
                ...membersStore.members,
                [member_id]: member,
              };
            }
          }
          const castingRoles = questStore.getCastingRolesById({
            member_id: availableRole.member_id,
            role_id: availableRole.role_id,
          });
          if (castingRoles?.length) {
            castingRoles.array.forEach((element) => {
              questStore.deleteCastingRole(element);
            });
          }
        }
      }
    },
  },
});
