import { registration_status_enum, permission_enum, ibis_node_type_enum } from "../enums";
import {
  Member,
  Guild,
  Quest,
  QuestMembership,
  GuildMembership,
  Casting,
  CastingRole,
} from "../types";
import { MyVapi, RetypeGetterTypes, RetypeActionTypes } from "./base";

export const BaseGetters = {
  hasPermission:
    (state) =>
    (
      permission: permission_enum,
      guildN?: number | Guild,
      questN?: number | Quest,
      nodeType?: ibis_node_type_enum
    ) => {
      const member = MyVapi.store.getters["member/getUser"];
      if (!member) return false;
      if (member.permissions.indexOf(permission) >= 0) return true;
      if (member.permissions.indexOf("superadmin") >= 0) return true;
      let guild: Guild;
      let quest: Quest;
      if (guildN) {
        guild =
          typeof guildN == "number"
            ? MyVapi.store.getters["guilds/getGuildById"](guildN)
            : guildN;
        if (guild) {
          const membership = (guild.guild_membership || []).find(
            (m: GuildMembership) =>
              m.member_id == member.id &&
              m.status == registration_status_enum.confirmed
          );
          if (membership?.permissions?.indexOf(permission) >= 0) return true;
          // TODO: check that permission is a guild permission
          if (membership?.permissions?.indexOf(permission_enum.guildAdmin) >= 0)
            return true;
        }
      }
      if (questN) {
        quest =
          typeof questN == "number"
            ? MyVapi.store.getters["quests/getQuestById"](questN)
            : questN;
        if (quest) {
          const membership = (quest.quest_membership || []).find(
            (m: QuestMembership) => m.member_id == member.id && m.confirmed
          );
          if (membership?.permissions?.indexOf(permission) >= 0) return true;
          // TODO: check that permission is a quest permission
          // if (membership.permissions.indexOf(permission_enum.questAdmin) >= 0) return true;
        }
      }
      if (guild && quest) {
        const casting = (member.casting || []).find(
          (c: Casting) =>
            c.guild_id == guild.id &&
            c.quest_id == quest.id
        );
        if (casting?.permissions?.indexOf(permission) >= 0) return true;
        const roles = (member.casting_role || []).filter((cr: CastingRole) =>
          cr.guild_id == guild.id && cr.quest_id == quest.id
        ).map((cr: CastingRole) => MyVapi.store.getters["roles/getRoleById"](cr.role_id));
        for (const role of roles) {
          if (role?.permissions?.indexOf(permission) >= 0) return true;
          if (nodeType) {
            const rnc = (role?.role_node_constraint || []).find(rnc => rnc.node_type == nodeType);
            if (rnc?.permissions?.indexOf(permission) >= 0) return true;
          }
        }
      }
      return false;
    },
};

export const BaseActions = {
  reset: (context) => {
    return Promise.all([
      context.dispatch("member/resetMember"),
      context.dispatch("members/resetMembers"),
      context.dispatch("quests/resetQuests"),
      context.dispatch("guilds/resetGuilds"),
      context.dispatch("role/resetRole"),
      context.dispatch("channel/resetChannel"),
    ]);
  },
};

export type BaseGetterTypes = RetypeGetterTypes<typeof BaseGetters>;
export type MemberActionTypes = RetypeActionTypes<typeof BaseActions>;
