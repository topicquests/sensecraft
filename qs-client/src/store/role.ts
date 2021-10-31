import {
  MyVapi,
  RestParamActionType,
  RestDataActionType,
  RestEmptyActionType,
  RetypeActionTypes,
  RetypeGetterTypes,
} from "./base";
import { AxiosResponse, AxiosInstance } from "axios";
import { Role, CastingRole, GuildMemberAvailableRole } from "../types";

interface RoleMap {
  [key: number]: Role;
}
export interface RoleSate {
  role: RoleMap;
  fullFetch: boolean;
  fullRole: {};
}

const baseState: RoleSate = {
  role: {},
  fullFetch: false,
  fullRole: {},
};

const RoleGetters = {};
export const RoleActions = {
  ensureAllRoles: async (context) => {
    if (context.state.role.length === 0 || !context.state.fullFetch) {
      await context.dispatch("fetchRoles");
    }
  },
  clearState: (context) => {
    context.commit("CLEAR_STATE");
  },
};

export const role = new MyVapi<RoleSate>({
  state: baseState,
})
  .get({
    action: "fetchRoles",
    property: "role",
    path: "/role",
    onSuccess: (state: RoleSate, res: AxiosResponse<Role[]>) => {
      const fullRole = Object.values(state.role).filter(
        (role: Role) => state.fullRole[role.id]
      );
      const roles = Object.fromEntries(
        res.data.map((role: Role) => [role.id, role])
      );
      for (const role of fullRole) {
        if (roles[role.id]) {
          roles[role.id] = Object.assign(roles[role.id], {});
        }
      }
      state.role = roles;
      state.fullFetch = true;
    },
  })
  .getVuexStore({
    getters: RoleGetters,
    actions: RoleActions,
    mutations: {
      CLEAR_STATE: (state: RoleSate) => {
        Object.assign(state, baseState);
      },
    },
  });
type RoleRestActionTypes = {
  fetchRoles: RestEmptyActionType<Role[]>;
};
export type RoleActionTypes = RetypeActionTypes<typeof RoleActions> &
  RoleRestActionTypes;
