import {
  MyVapi, RestDataActionType, RestEmptyActionType, RetypeActionTypes, RetypeGetterTypes,
} from "./base";
import { AxiosResponse, AxiosInstance } from "axios";
import { ServerData } from "src/types";

export interface ServerDataState {
  serverData: ServerData;
}
const baseState: ServerDataState = {
  serverData: null,
};


const serverDataGetters = {
  getServerData: (state: ServerDataState) => state.serverData,
};

const serverDataActions = {
  ensureServerData: async (context) => {
    if (!context.state.serverData) {
      await context.dispatch("fetchServerData");
      return context.state.serverData;
    }
  },

}

export const serverData = (axios: AxiosInstance) =>
  new MyVapi<ServerDataState>({
    axios,
    state: baseState,
  })
    // Step 3
    .get({
      action: "fetchServerData",
      property: "serverData",
      path: "/server_data",
      onSuccess: (
        state: ServerDataState,
        res: AxiosResponse<ServerData[]>,
        axios: AxiosInstance,
        actionParams
      ) => {
        state.serverData = res.data[0];
      },
    })
    .patch({
      action: "updateServerData",
      property: "serverData",
      path: "/server_data",
      onSuccess: (
        state: ServerDataState,
        res: AxiosResponse<ServerData[]>,
        axios: AxiosInstance,
        { params, data }
      ) => {
        state.serverData = Object.assign({}, state.serverData, res.data[0]);
      },
    })
    .call({
      action: "resetDefaultSingle",
      property: "varname",
      path: "reset_default_data",
      onSuccess: (
        state: ServerDataState,
        res: AxiosResponse<string>,
        axios: AxiosInstance,
        { params, data }
      ) => {
        MyVapi.store.dispatch("stateData/fetchServerData");
      },
    })
    .call({
      action: "resetDefaultAll",
      path: "reset_all_default_data",
      onSuccess: (
        state: ServerDataState,
        res: AxiosResponse<string>,
        axios: AxiosInstance,
        { params, data }
      ) => {
        MyVapi.store.dispatch("stateData/fetchServerData");
      },
    })
    // Step 4
    .getVuexStore({
      getters: serverDataGetters,
      actions: serverDataActions,
      mutations: {},
    });

type serverDataRestActionTypes = {
  fetchServerData: RestEmptyActionType<ServerData[]>,
  updateServerData: RestDataActionType<Partial<ServerData>, ServerData[]>,
  resetDefaultSingle: RestEmptyActionType<string>,
  resetDefaultAll: RestEmptyActionType<void>,
};

export type ServerDataActionTypes = RetypeActionTypes<typeof serverDataActions> &
  serverDataRestActionTypes;
export type ServerDataGetterTypes = RetypeGetterTypes<typeof serverDataGetters>;
