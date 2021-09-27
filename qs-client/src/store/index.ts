import Vue from "vue";
import Vuex from "vuex";
import { quests } from "./quests";
import { members } from "./members";
import { member } from "./member";
import { guilds } from "./guilds";
import { conversation } from "./conversation";
import MyVapi from "./base";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    member,
    members,
    conversation,
    quests,
    guilds,
  },
  getters: {
    hasPermission: (state) => (permission, guild, quest) => {
      const member = store.getters["member/getUser"];
      if (!member) return false;
      if (member.permissions.indexOf(permission) >= 0) return true;
      if (member.permissions.indexOf("superadmin") >= 0) return true;
      if (guild) {
        if (!!Number.parseInt(guild)) {
          guild = store.getters["guilds/getGuildById"](guild);
        }
        const membership = (guild.guild_membership || []).find(
          (m) => m.member_id == member.id && m.status == "confirmed"
        );
        if (membership) {
          if (membership.permissions.indexOf(permission) >= 0) return true;
          // TODO: check that permission is a guild permission
          if (membership.permissions.indexOf("guildAdmin") >= 0) return true;
        }
      }
      if (quest) {
        if (!!Number.parseInt(quest)) {
          quest = store.getters["quests/getQuestById"](quest);
        }
        const membership = (quest.quest_membership || []).find(
          (m) => m.member_id == member.id && m.status == "confirmed"
        );
        if (membership) {
          if (membership.permissions.indexOf(permission) >= 0) return true;
          // TODO: check that permission is a quest permission
          if (membership.permissions.indexOf("questAdmin") >= 0) return true;
        }
      }
      if (guild && quest) {
        const casting = (quest.casting || []).find(
          (c) =>
            c.guild_id == guild.id &&
            c.quest_id == quest.id &&
            c.member_id == member.id
        );
        if (casting) {
          if (casting.permissions.indexOf(permission) >= 0) return true;
        }
      }
      return false;
    },
  },
});

// make the store available to all components
MyVapi.store = store;

export default store;
