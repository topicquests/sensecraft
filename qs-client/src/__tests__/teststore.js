import clone from "lodash.clonedeep";
import merge from "lodash.merge";
import { Store } from "vuex-mock-store";
import getStore from "../store";

const store = getStore(null);

// This is a mock store created from a real store, so all getters are exactly as in the store.
// vuex-mock-store recommends writing the getters by hand, but this is error-prone with complex getters.
// The actions and mutators are still jest mocks.

class StoreWithGetters extends Store {
  constructor(store, extraState = {}) {
    let state = JSON.parse(JSON.stringify(store.state));
    state = merge(state, extraState);
    // placeholder so I can use this
    let getters = store.getters;
    super({ state, getters });
    getters = {};
    for (const name in store.getters) {
      const nspos = name.indexOf("/");
      if (nspos > 0) {
        const [moduleName, getterName] = name.split("/");
        const module = store._modulesNamespaceMap[moduleName + "/"]._rawModule;
        const getter = module.getters[getterName];
        getters[name] = {
          get: () => getter(this.state[moduleName]),
          enumerable: true,
        };
      } else {
        const module = store._modules.root._rawModule;
        const getter = module.getters[name];
        getters[name] = {
          get: () => getter(this.state),
          enumerable: true,
        };
      }
    }
    getters = Object.defineProperties({}, getters);
    this.getters = this._initialGetters = getters;
  }

  _initialize() {
    // do not flatten getters, keep them live
    this.state = clone(this._initialState);
    this._mutationsHandlers = [];
    this._actionsHandlers = [];
  }
}

export function makeTestStore(baseState = {}) {
  return new StoreWithGetters(store, baseState);
}

export const testStore = makeTestStore();
