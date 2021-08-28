import Vue from 'vue'
import Vuex from 'vuex'
import { FeathersVuex } from "../boot/feathersClient";
import authvuex from "./store.auth";
import quests from './quest'
import member from './member'
import guilds from './guild'
import conversation from './conversation'


const requireModule = require.context(
  // The path where the service modules live
  "../services/feathers-client",
  // Whether to look in subfolders
  false,
  // Only include .js files (prevents duplicate imports`)
  /.js$/
);
// import example from './module-example'
const servicePlugins = requireModule
  .keys()
  .map(modulePath => requireModule(modulePath).default);

Vue.use(Vuex)
Vue.use(FeathersVuex);


export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    state: {},
    mutations: {},
    actions: {},
    plugins: [...servicePlugins, authvuex],
    modules: {
      quests,
      member,
      guilds,
      conversation
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEBUGGING
  })

  return Store
}