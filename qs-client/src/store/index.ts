import Vue from "vue";
import Vuex from "vuex";
import { quests } from "./quests";
import { members } from "./members";
import { member } from "./member";
import { guilds } from "./guilds";
import { conversation } from "./conversation";
import { channel } from "./channel";
import { role } from "./role";
import { MyVapi } from "./base";
import { BaseGetters } from "./baseStore";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    member,
    members,
    conversation,
    quests,
    guilds,
    role,
    channel,
  },
  getters: BaseGetters,
});

// make the store available to all components
MyVapi.store = store;

export default store;
