import {
} from "./base";
import { ConversationNode, ReadStatusData } from "../types";
import { defineStore } from 'pinia';
import { useMemberStore } from "./member";
import { useConversationStore } from "./conversation";
import { useChannelStore } from "./channel";
import { api } from "src/boot/axios";
import { AxiosResponse } from "axios";

export interface ReadStatusMap {
  [key: number]: ReadStatusData;
}
export interface ReadStatusState {
  fullFetch: false;
  readStatus?: ReadStatusMap;
}
const baseState: ReadStatusState = {
  fullFetch: false,
  readStatus: undefined,
};
const clearBaseState: ReadStatusState = {
  fullFetch: false,
  readStatus: undefined,
};

export const useReadStatusStore = defineStore('readStatus', {
  state: () => baseState,
  getters: {
    getNodeReadStatus: (state: ReadStatusState) => (node_id: number) => {
      const memberStore = useMemberStore();
      const memberId = memberStore.getUserId;
      if(state.readStatus){
      const read = Object.values(state.readStatus).filter(
        (isRead: ReadStatusData) => isRead.node_id == node_id && memberId
      );
      if (read.length > 0) {
        return state.readStatus[node_id].status;
      } else return true;
    }
  },
    getUnreadStatusCount: (state: ReadStatusState) => (node_id: number) => {
      if(state.readStatus) {
        const unreadStatusCount: number =
          state.readStatus[node_id].node_count -
          state.readStatus[node_id].read_count;
      return unreadStatusCount;
      }
    },
    getNodeStatusCount: (state: ReadStatusState) => (node_id: number) => {
      if(state.readStatus) {
        return state.readStatus[node_id].node_count;
      }
    },
  },
  actions: {
    async ensureAllQuestsReadStatus(){
      const conversationStore = useConversationStore();
      if (conversationStore.conversationRoot) {
      const cn: ConversationNode =
        conversationStore.conversationRoot;
      
      const rootid: number = cn.id;
      await this.fetchReadStatus({ rootid });
      }
    },
    async ensureAllChannelReadStatus() {
      const channelStore = useChannelStore();
      if(channelStore.getCurrentChannel) {
        const rootid = channelStore.getCurrentChannel;
        await this.fetchReadStatus({ rootid });
      }
    },
    resetReadStatus() {
      Object.assign(this, clearBaseState);
    },
    async creatReadStatus(data: Partial<ReadStatusData>) {
      const res: AxiosResponse<ReadStatusData[]>=await api.post('/read_status', {
        data
      })
      if(res.status==200) {
        const readStatusData: ReadStatusData = Object.assign(res.data[0], {
          node_id: null,
        });
        this.readStatus = {
          ...this.readStatus,
          [readStatusData.node_id]: readStatusData,
        };
      }
    },
    async updateReadStatus(data:Partial<ReadStatusData>) {
      const res:AxiosResponse<ReadStatusData[]>=await api.patch(`/readstatus/${data.node_id}`, data)
      if(res.status==200) {
        const readStatus = res.data[0];
        if(this.readStatus) {
          const readStatusData: ReadStatusData = Object.assign(
          this.readStatus[readStatus.node_id],
          readStatus
          );
          this.readStatus = {
          ...this.readStatus,
          [readStatus.node_id]: readStatusData,
          };
        }
      }
    },
    async fetchReadStatus(params:{rootid:number}) {
      const res:AxiosResponse<ReadStatusData[]>=await api.post('rpc/unread_status_list', {
        params
      })
      if(res.status==200) {
        this["readStatus"] = Object.fromEntries(
          res.data.map((x) => [x.node_id, x])
        );
      }
    },
    async CreateOrUpdateReadStatus() {
      const res:AxiosResponse<{
        new_node_id: number;
        new_member_id: number;
        status_new: boolean;
      }> = await api.post('node_set_read_status')
      if(res.status==200){
       const memberStore=useMemberStore();
        const memberId = memberStore.getUserId;
        const node_id = res.data.new_node_id;
        const newReadStatus: ReadStatusData = {
          node_id,
          member_id: res.data.new_member_id,
          seconds_shown: 0,
          status: res.data.status_new,
          node_count: 0,
          read_count: 0,
        };
        if(this.readStatus) {
        const read = Object.values(this.readStatus).filter(
          (isRead: ReadStatusData) => isRead.node_id == node_id && memberId
        ); 
               
        if (read.length > 0 && this.readStatus) {
          this.readStatus[node_id].status = res.data.status_new;
        } else {
          this.readStatus = {
            ...this.readStatus,
            [node_id]: newReadStatus,
          };
        } 
      }
      }
    }
  }
}); 
