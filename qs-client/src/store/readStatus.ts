import {
  MyVapi,
  RestDataActionType,
  RestParamActionType,
  RetypeActionTypes,
  RetypeGetterTypes,
} from "./base";
import { ReadStatusData } from "../types";

import { AxiosInstance, AxiosResponse } from "axios";

export interface ReadStatusMap {
  [key: number]: ReadStatusData;
}
export interface ReadStatusState {
  fullFetch: false;
  readStatus: ReadStatusMap;
}

const ReadStatusGetter = {
  getNodeReadStatus: (state: ReadStatusState) => (node_id: number) => {
    const read = Object.values(state.readStatus).filter(
      (isRead: ReadStatusData) => isRead.node_id == node_id
    );
    if (read.length > 0) {
      console.log("status: ", read);
      return false;
    } else return true;
  },
  setNodeReadStatus: (state: ReadStatusState) => (node_id: number) => {
    const read = Object.values(state.readStatus).filter(
      (isRead: ReadStatusData) => isRead.node_id == node_id
    );
    if (read.length > 0) {
      if (
        state.readStatus[node_id].status == null ||
        state.readStatus[node_id].status == false
      ) {
        state.readStatus[node_id].status = true;
      } else {
        state.readStatus[node_id].status = false;
      }
    }
  },
};

const ReadStatusActions = {
  ensureAllQuestsReadStatus: async (context) => {
    const rootid = MyVapi.store.state["conversation"]["neighbourhoodRoot"];
    await context.dispatch("fetchReadStatus", { params: { rootid } });
  },
};
const baseState: ReadStatusState = {
  fullFetch: false,
  readStatus: null,
};

export const readStatus = (axios: AxiosInstance) =>
  new MyVapi<ReadStatusState>({
    axios,
    state: baseState,
  })
    .post({
      action: "CreateReadStatus",
      path: "/read_status",
      onSuccess: (
        state: ReadStatusState,
        res: AxiosResponse<ReadStatusData[]>,
        axios: AxiosInstance,
        { data }
      ) => {
        const readStatusData: ReadStatusData = Object.assign(res.data[0], {
          node_id: null,
        });
        state.readStatus = {
          ...state.readStatus,
          [readStatusData.node_id]: readStatusData,
        };
      },
    })
    .patch({
      action: "updateReadStatus",
      path: ({ id }) => `/readStatus?node_id=eq.${id}`,
      beforeRequest: (state: ReadStatusState, actionParams) => {
        const { params, data } = actionParams;
        params.id = data.id;
      },
      onSuccess: (
        state: ReadStatusState,
        res: AxiosResponse<ReadStatusData[]>,
        axios: AxiosInstance,
        { data }
      ) => {
        const readStatus = res.data[0];
        const readStatusData: ReadStatusData = Object.assign(
          state.readStatus[readStatus.node_id],
          readStatus
        );
        state.readStatus = {
          ...state.readStatus,
          [readStatus.node_id]: readStatusData,
        };
      },
    })

    .call({
      action: "fetchReadStatus",
      path: "unread_status_list",
      property: "readStatus",
      readOnly: true,
      onSuccess: (
        state: ReadStatusState,
        res: AxiosResponse<ReadStatusData[]>,
        axios: AxiosInstance,
        actionParams
      ) => {
        state["readStatus"] = Object.fromEntries(
          res.data.map((x) => [x.node_id, x])
        );
      },
    })
    .getVuexStore({
      getters: ReadStatusGetter,
      actions: ReadStatusActions,
      mutations: {},
    });
type ReadStatusRestActionTypes = {
  fetchReadStatus: RestParamActionType<{ rootid: number }, ReadStatusData[]>;

  createReadStatus: RestDataActionType<
    Partial<ReadStatusData>,
    ReadStatusData[]
  >;
};

export type ReadStatusActionTypes = RetypeActionTypes<
  typeof ReadStatusActions & ReadStatusRestActionTypes
>;

export type ReadStatusGetterTypes = RetypeGetterTypes<typeof ReadStatusGetter>;
