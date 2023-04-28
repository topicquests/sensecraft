import { MyVapi, RestParamActionType, RetypeActionTypes } from "./base";
import { ReadStatus } from "../types";

import { AxiosInstance, AxiosResponse } from "axios";

export interface ReadStatusMap {
  [key: number]: ReadStatus;
}
export interface ReadStatusState {
  fullFetch: false;
  readStatus: ReadStatusMap;
}

const ReadStatusActions = {
  ensureAllQuestsReadStatus: async (context) => {
    const questid = MyVapi.store.state["quests"]["currentQuest"];
    console.log(
      "need to fetch read status",
      questid,
      MyVapi.store.getters["member/getUserId"]
    );
    await context.dispatch("fetchReadStatus", { params: { questid } });
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
    .call({
      action: "fetchReadStatus",
      path: "unread_status_list",
      property: "readStatus",
      readOnly: true,
      onSuccess: (
        state: ReadStatusState,
        res: AxiosResponse<ReadStatus[]>,
        axios: AxiosInstance,
        actionParams
      ) => {
        console.log("read status response: ", res.data);
      },
    })
    .getVuexStore({
      actions: ReadStatusActions,
      mutations: {},
    });
type ReadStatusRestActionTypes = {
  fetchReadStatus: RestParamActionType<{ questid: number }, ReadStatus[]>;
};
export type ReadStatusActionTypes = RetypeActionTypes<
  typeof ReadStatusActions & ReadStatusRestActionTypes
>;
