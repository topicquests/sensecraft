import { MyVapi, RestEmptyActionType } from "./base";
import { AxiosResponse, AxiosInstance } from "axios";
import { ServerData } from "src/types";

interface ServerDataMap {
  [key: number]: ServerData;
}
export interface ServerDataState {
  serverData: ServerDataMap;
}
const baseState: ServerDataState = {
  serverData: [],
};

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
      queryParams: true,
      onSuccess: (
        state: ServerDataState,
        res: AxiosResponse<ServerData[]>,
        axios: AxiosInstance,
        actionParams
      ) => {},
    });

type ServerDataRestActionTypes = {
  fetchServerData: RestEmptyActionType<ServerData[]>;
};

export type ServerDataActionTypes = ServerDataRestActionTypes;
