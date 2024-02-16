import {
} from "./base";
import { ConversationNode, ReadStatusData } from "../types";
import { defineStore } from 'pinia';

import { AxiosResponse } from "axios";

export interface ReadStatusMap {
  [key: number]: ReadStatusData;
}
export interface ReadStatusState {
  fullFetch: false;
  readStatus: ReadStatusMap;
}
const baseState: ReadStatusState = {
  fullFetch: false,
  readStatus: null,
};

export const useReadStatusStore = defineStore('readStatus', {
  state: () => baseState,
  getters: {
    getNodeReadStatus: (state: ReadStatusState) => (node_id: number) => {
      const memberStore = useMemberStore();
      const memberId = memberStore.getUserId();
      const read = Object.values(state.readStatus).filter(
        (isRead: ReadStatusData) => isRead.node_id == node_id && memberId
      );
      if (read.length > 0) {
        return state.readStatus[node_id].status;
      } else return true;
    },
    getUnreadStatusCount: (state: ReadStatusState) => (node_id: number) => {
      const unreadStatusCount: number =
        state.readStatus[node_id].node_count -
        state.readStatus[node_id].read_count;
      return unreadStatusCount;
    },
    getNodeStatusCount: (state: ReadStatusState) => (node_id: number) => {
      return state.readStatus[node_id].node_count;
    },
  },
  actions: {
    ensureAllQuestsReadStatus: async (context) => {
      const conversationStore = useConversationStore();
      const cn: ConversationNode =
        conversationStore.conversationRoot();
      const rootid: number = cn.id;
      await context.dispatch("fetchReadStatus", { params: { rootid } });
    },
    ensureAllChannelReadStatus: async (context) => {
      const channelStore = useChannelStore();
      const rootid = channelStore.getCurrentChannel();
      await context.dispatch("fetchReadStatus", { params: { rootid } });
    },
    resetReadStatus: (context) => {
      context.commit("CLEAR_STATE");
    },
  }
})  

/*
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
    .call({
      action: "CreateOrUpdateReadStatus",
      path: "node_set_read_status",
      property: "readStatus",
      queryParams: true,
      onSuccess: (
        state: ReadStatusState,
        res: AxiosResponse<{
          new_node_id: number;
          new_member_id: number;
          status_new: boolean;
        }>,
        axios: AxiosInstance,
        actionParams
      ) => {
        const memberId = MyVapi.store.getters["member/getUserId"];
        const node_id = res.data[0].new_node_id;
        const newReadStatus: ReadStatusData = {
          node_id,
          member_id: res.data[0].new_member_id,
          seconds_shown: 0,
          status: res.data[0].status_new,
          node_count: 0,
          read_count: 0,
        };
        const read = Object.values(state.readStatus).filter(
          (isRead: ReadStatusData) => isRead.node_id == node_id && memberId
        );
        if (read.length > 0) {
          state.readStatus[node_id].status = res.data[0].status_new;
        } else {
          state.readStatus = {
            ...state.readStatus,
            [node_id]: newReadStatus,
          };
        }
      },
    })
    .getVuexStore({
      getters: ReadStatusGetter,
      actions: ReadStatusActions,
      mutations: {
        CLEAR_STATE: (state: ReadStatusState) => {
          Object.assign(state, baseState);
        },
      },
    });
type ReadStatusRestActionTypes = {
  fetchReadStatus: RestParamActionType<{ rootid: number }, ReadStatusData[]>;
  CreateOrUpdateReadStatus: RestParamActionType<
    { nodeid: number; new_status: boolean; override: boolean },
    ReadStatusData[]
  >;

  createReadStatus: RestDataActionType<
    Partial<ReadStatusData>,
    ReadStatusData[]
  >;
};

export type ReadStatusActionTypes = RetypeActionTypes<
  typeof ReadStatusActions & ReadStatusRestActionTypes
>;

export type ReadStatusGetterTypes = RetypeGetterTypes<typeof ReadStatusGetter>;
*/