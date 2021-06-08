import Vue from 'vue'
import Vuex from 'vuex'
import * as account from "./account";
import { FeathersVuex } from "../boot/feathersClient";
import authvuex from "./store.auth";
import quests from './modules/quests.js'


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

    plugins: [...servicePlugins, authvuex],
    modules: {
      account,
      quests
    }, 

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEBUGGING
  })

  return Store
}