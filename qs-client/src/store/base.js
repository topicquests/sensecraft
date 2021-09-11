import Vapi from "vuex-rest-api"
import axiosInstance from "../boot/axios"

class MyVapi extends Vapi {
  constructor(options) {
    super({ baseURL: server_url, axios: axiosInstance, ...options });
  }
  static store = null;
  getStore(options) {
    const {getters, mutations, actions, ...ooptions} = options || {};
    const store = super.getStore({ namespaced: true, ...ooptions });
    store.getters = getters;
    store.mutations = {...store.mutations, ...(mutations || {})};
    store.actions = {...store.actions, ...(actions || {})};
    return store;
  }
  delete(options) {
    options.headers = Object.assign({}, options.headers, { Prefer: 'return=representation' });
    return super.delete(options);
  }
  post(options) {
    options.headers = Object.assign({}, options.headers, { Prefer: 'return=representation' });
    return super.post(options);
  }
  call(options) {
    options.path = `/rpc/${options.path}`
    return super.post(options);
  }
  add(options) {
    const baseHeaders = options.headers || {};
    return super.add(Object.assign(options, {
      headers: (params) => {
        const token = MyVapi.store?.state.member.token;
        if (token) {
          return Object.assign(baseHeaders, {
            Authorization: `Bearer ${token}`
          })
        } else {
          return baseHeaders
        }
      }
    }))
  }
}

export default MyVapi;
