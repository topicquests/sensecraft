import Vue from "vue";
import Vuex from "vuex";
import type { Store } from "vuex";
import { quests } from "./quests";
import { members } from "./members";
import { member } from "./member";
import { guilds } from "./guilds";
import { conversation } from "./conversation";
import { channel } from "./channel";
import { role } from "./role";
import { serverData } from "./serverData";
import { MyVapi } from "./base";
import { BaseGetters, BaseActions } from "./baseStore";
import type { AxiosInstance } from "axios";

Vue.use(Vuex);

// singleton
let STORE: Store<any> = null;

export default function getStore(axios: AxiosInstance) {
  if (STORE === null) {
    STORE = new Vuex.Store({
      modules: {
        member: member(axios),
        members: members(axios),
        conversation: conversation(axios),
        quests: quests(axios),
        guilds: guilds(axios),
        role: role(axios),
        channel: channel(axios),
        serverData: serverData(axios),
      },
      getters: BaseGetters,
      actions: BaseActions,
    });

    // make the store available to all components
    MyVapi.store = STORE;
  }
  return STORE;
}
