import { Store as VuexStore } from "vuex";
import Vapi from "vuex-rest-api";
import {
  Store as VapiStore,
  StoreOptions as VapiStoreOptions,
  ActionMap,
  MutationMap,
} from "vuex-rest-api/dist/Store";
import {
  ResourceOptions,
  ShorthandResourceActionOptions,
  ResourceActionOptions,
} from "vuex-rest-api/dist/Resource";
import axiosInstance from "../boot/axios";
import { AxiosResponse } from "axios";

declare const server_url: string;

export type RestActionType<P, D, R> = ({
  params,
  data,
}: {
  params: P;
  data: D;
}) => Promise<AxiosResponse<R>>;
export type RestParamActionType<P, R> = ({
  params,
  data,
}: {
  params: P;
  data?: {};
}) => Promise<AxiosResponse<R>>;
export type RestDataActionType<D, R> = ({
  params,
  data,
}: {
  params?: {};
  data: D;
}) => Promise<AxiosResponse<R>>;
export type RestEmptyActionType<R> = (actionParams?: {
  params?: {};
  data?: {};
}) => Promise<AxiosResponse<R>>;
type ActionFn<F extends (...args: any) => any> = (
  ...args: [...Parameters<F>[1]]
) => ReturnType<F>;
export type RetypeActionTypes<
  T extends { [key: string]: (...args: any) => any }
> = { [K in keyof T]: ActionFn<T[K]> };
export type RetypeGetterTypes<
  T extends { [key: string]: (...args: any) => any }
> = { [K in keyof T]: ReturnType<T[K]> };
export type p0<F extends (...args: any) => any> = Parameters<F>[0];

interface GetterMap {
  [action: string]: Function;
}

interface MyVapiStore extends VapiStore {
  getters?: GetterMap;
}
interface StoreOptions extends VapiStoreOptions {
  getters?: GetterMap;
  actions?: ActionMap;
  mutations?: MutationMap;
}

interface CallResourceActionOptions extends ShorthandResourceActionOptions {
  readOnly?: boolean;
}

export class MyVapi<S> extends Vapi {
  constructor(options: ResourceOptions) {
    super({ baseURL: server_url, axios: axiosInstance, ...options });
  }
  static store: VuexStore<any>;
  getStore(options: StoreOptions): MyVapiStore {
    const { getters, mutations, actions, ...ooptions } = options || {};
    const store = super.getStore({
      namespaced: true,
      ...ooptions,
    }) as MyVapiStore;
    store.getters = getters;
    store.mutations = { ...store.mutations, ...(mutations || {}) };
    store.actions = { ...store.actions, ...(actions || {}) };
    return store;
  }
  getVuexStore(options: StoreOptions): VuexStore<S> {
    return this.getStore(options) as unknown as VuexStore<S>;
  }
  get(options: ShorthandResourceActionOptions): MyVapi<S> {
    return super.get(options) as MyVapi<S>;
  }
  delete(options: ShorthandResourceActionOptions): MyVapi<S> {
    options.headers = Object.assign({}, options.headers, {
      Prefer: "return=representation",
    });
    return super.delete(options) as MyVapi<S>;
  }
  post(options: ShorthandResourceActionOptions): MyVapi<S> {
    options.headers = Object.assign({}, options.headers, {
      Prefer: "return=representation",
    });
    return super.post(options) as MyVapi<S>;
  }
  patch(options: ShorthandResourceActionOptions): MyVapi<S> {
    options.headers = Object.assign({}, options.headers, {
      Prefer: "return=representation",
    });
    return super.patch(options) as MyVapi<S>;
  }
  call(options: CallResourceActionOptions): MyVapi<S> {
    if (typeof options.path == "string") {
      options.path = `/rpc/${options.path}`;
    }
    if (options.readOnly) {
      options.queryParams = true;
      return super.get(options) as MyVapi<S>;
    } else {
      return super.post(options) as MyVapi<S>;
    }
  }
  add(options: ResourceActionOptions): MyVapi<S> {
    const baseHeaders = options.headers || {};
    return super.add(
      Object.assign(options, {
        headers: (params: Object) => {
          const token = MyVapi.store?.state.member.token;
          const tokenExpiry = MyVapi.store?.state.member.tokenExpiry;
          if (token && tokenExpiry && Date.now() < tokenExpiry) {
            return Object.assign(baseHeaders, {
              Authorization: `Bearer ${token}`,
            });
          } else {
            return baseHeaders;
          }
        },
      })
    ) as MyVapi<S>;
  }
}
