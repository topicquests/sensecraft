import Vue from "vue";
import Vuex from "vuex";
import { quests } from "./quests";
import { members } from "./members";
import { member } from "./member";
import { guilds } from "./guilds";
import { conversation } from "./conversation";
import { MyVapi } from "./base";
import { BaseGetters } from "./baseStore";

const store = new Vuex.Store({
  modules: {
    member,
    members,
    conversation,
    quests,
    guilds,
  },
  getters: BaseGetters,
});

// make the store available to all components
MyVapi.store = store;

export default store;
