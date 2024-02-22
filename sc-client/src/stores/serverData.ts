import { AxiosResponse } from "axios";
import { ServerData } from "src/types";
import { defineStore } from 'pinia';
import { api } from '../boot/axios';

export interface ServerDataState {
  serverData: ServerData;
}
const baseState: ServerDataState = {
  serverData: null,
};
export const useServerDataStore = defineStore('serverData', {
  state: () => baseState,

  getters: {
    getServerData: (state: ServerDataState) => state.serverData,
  },

  actions: {
    async ensureServerData ()  {
      if (!this.serverData) {
        await this.fetchServerData();
        return this.serverData;
      }
    },
    async resetServerData ()  {
      if (this.serverData) {
        await this.fetchServerData();
        return this.serverData;
      }
    },
 
    async fetchServerData():Promise<serverData> {
      const res: AxiosResponse<Member[]> = await api.get('/server_data')
      if(res == 200) {
        this.serverData = res.data[0];
      }
    },
    async updateServerData(serverData):Partial<serverData> {
      const res: AxiosResponse<Member[]> = await api.patch('/server_data', serverData)
      if(res == 200) {
        this.serverData = Object.assign({}, this.serverData, res.data[0]);
      }
    },
    async resetDefaultSingle(): string {
      const res: AxiosResponse<Member[]> = await api.get('/server_data', serverData)
      if (res==200) {
        fetchServerData();
      }
    },
    async resetDefaultAll(): void {
      const res: AxiosResponse<Member[]> = await api.post('/rpc/reset_all_default_data', serverData)
      if (res==200) {
        fetchServerData();
      }
    },
  },
})
   

