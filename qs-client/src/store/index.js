import Vue from 'vue'
import Vuex from 'vuex'
import account from "./modules/account";
import { FeathersVuex } from "../boot/feathersClient";
import authvuex from "./store.auth";


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
/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    state: {
  
     },
    
     getters: {
     
    },

    actions: {

    },

    mutations: {        
    
    },
    
    plugins: [...servicePlugins, authvuex],
    modules: {
      account
    }, 

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEBUGGING
  })

  return Store
}