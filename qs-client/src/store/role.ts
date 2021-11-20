import {
  MyVapi,
  RestParamActionType,
  RestDataActionType,
  RestEmptyActionType,
  RetypeActionTypes,
  RetypeGetterTypes,
} from "./base";
import { AxiosResponse, AxiosInstance } from "axios";
import { Role } from "../types";

interface RoleMap {
  [key: number]: Role;
}
export interface RoleState {
  role: RoleMap;
  fullFetch: boolean;
  fullRole: {};
}

const baseState: RoleState = {
  role: [],
  fullFetch: false,
  fullRole: {},
};

const RoleGetters = {
  getRoleById: (state: RoleState) => (id: number) => state.role[id],
  getRoleByName: (state: RoleState) => (name: string) => state.role[name],
  getRoles: (state: RoleState) =>
    Object.values(state.role).sort((a, b) => a.name.localeCompare(b.name)),
};
export const RoleActions = {
  ensureAllRoles: async (context) => {
    if (context.state.role.length === 0 || !context.state.fullFetch) {
      await context.dispatch("fetchRoles");
    }
  },
  createRole: async (context, { data }) => {
    const res = await context.dispatch("createRole", { data });
  },
  clearState: (context) => {
    context.commit("CLEAR_STATE");
  },
};

export const role = new MyVapi<RoleState>({
  state: baseState,
})
  .get({
    action: "fetchRoles",
    property: "role",
    path: "/role",
    onSuccess: (state: RoleState, res: AxiosResponse<Role[]>) => {
      const roles = Object.fromEntries(
        res.data.map((role: Role) => [role.id, role])
      );
      console.log("Roles: ", roles);
      state.role = roles;
      state.fullFetch = true;
    },
  })
  .get({
    action: "createRole",
    property: "role",
    path: "/role",
    onSuccess: (
      state: RoleState,
      res: AxiosResponse<Role[]>,
      axios: AxiosInstance,
      { data }
    ) => {
      const role = res.data[0];
      state.role = { ...state.role, [role.id]: role };
    },
  })
  .patch({
    action: "updateRole",
    path: ({ id }) => `/role?id=eq.${id}`,
    beforeRequest: (state: RoleState, { params, data }) => {
      params.id = data.id;
      data.slug = undefined;
      Object.assign(data, {
        updated_at: undefined,
      });
    },
    onSuccess: (
      state: RoleState,
      res: AxiosResponse<Role[]>,
      axios: AxiosInstance,
      { data }
    ) => {
      let role = res.data[0];
      role = Object.assign({}, state.role[role.id], role);
      state.role = { ...state.role, [role.id]: role };
    },
  })
  .getVuexStore({
    getters: RoleGetters,
    actions: RoleActions,
    mutations: {
      CLEAR_STATE: (state: RoleState) => {
        Object.assign(state, baseState);
      },
    },
  });

type RoleRestActionTypes = {
  fetchRoles: RestEmptyActionType<Role[]>;
  createRole: RestDataActionType<Partial<Role>, Role[]>;
  updateRole: RestDataActionType<Partial<Role>, Role[]>;
};
export type RoleActionTypes = RetypeActionTypes<typeof RoleActions> &
  RoleRestActionTypes;
export type RoleGetterTypes = RetypeGetterTypes<typeof RoleGetters>;
