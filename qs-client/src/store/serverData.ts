import { MyVapi, RestEmptyActionType } from "./base";
import { AxiosResponse, AxiosInstance } from "axios";
import { ServerData } from "src/types";

export interface ServerDataState {
  serverData: ServerData;
}

export const serverData = (axios: AxiosInstance) =>
  new MyVapi<ServerDataState>({
    axios,
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
