import { filterKeys } from "./baseStore";
import { defineStore } from 'pinia'
import { AxiosResponse, AxiosInstance } from "axios";
import { Role, RoleNodeConstraint, rolePatchKeys } from "../types";

interface RoleMap {
  [key: number]: Role;
}
export interface RoleState {
  role: RoleMap;
  fullFetch: boolean;
  fullRole: { [key: number]: boolean };
}
interface RoleNodeConstraintMap {
  [key: number]: RoleNodeConstraint;
}
export interface RoleNodeConstraintState {
  roleNodeConstraint: RoleNodeConstraintMap;
}

const baseState: RoleState = {
  role: [],
  fullFetch: false,
  fullRole: {},
};

export const useRoleStore = defineStore('role', {
  state: () => baseState,

  getters: {
    getRoleById: (state: RoleState) => (id: number) => state.role[id],
    getRoleByName: (state: RoleState) => (name: string) => state.role[name],
    getRoles: (state: RoleState) =>
      Object.values(state.role).sort((a, b) => a.name.localeCompare(b.name)),
    getRoleNodeConstraintsByRoleId: (state: RoleState) => (id: number) =>
      state.role[id].role_node_constraint,
    getRoleNodeConstraintByType:
      (state: RoleState) => (id: number, node_type: string) => {
        const roleNodeConstraint: RoleNodeConstraint[] = state.role[
          id
        ].role_node_constraint.filter(
          (node: RoleNodeConstraint) => node.node_type == node_type
        );
        return roleNodeConstraint;
      },
  },
  actions: {
    ensureAllRoles: async () => {
      if (context.state.role.length === 0 || !context.state.fullFetch) {
        await context.dispatch("fetchRoles");
      }
    },
    ensureRole: async (
      context,
      { role_id, full = true }: { role_id: number; full?: boolean }
    ) => {
      if (
        context.getters.getRoleById(role_id) === undefined ||
        (full && !context.state.fullRole[role_id])
      ) {
        await context.dispatch("fetchRoleById", {
          full,
          params: { id: role_id },
        });
      }
    },
    createRole: async (context, { data }) => {
      const res = await context.dispatch("createRoleBase", { data });
      await context.dispatch("fetchRoles");
      return res.data[0];
    },
    resetRole: (context) => {
      context.commit("CLEAR_STATE");
    },
    createRoleNodeConstraint: async (context, { data }) => {
      await context.dispatch("createRoleNodeConstraintBase", {
        data,
      });
      await context.dispatch("fetchRoles");
    },
    updateRoleNodeConstraint: async (context, { data }) => {
      await context.dispatch("updateRoleNodeConstraintBase", {
        data,
      });
      await context.dispatch("fetchRoles");
    },
    deleteRoleNodeConstraint: async (context, { data }) => {
      await context.dispatch("deleteRoleNodeConstraintBase", {
        data,
      });
      await context.dispatch("fetchRoles");
    },
  }
});

export const role = (axios: AxiosInstance) =>
  new MyVapi<RoleState>({
    axios,
    state: baseState,
  })
    .get({
      action: "fetchRoles",
      property: "role",
      path: "/role",
      queryParams: true,
      beforeRequest: (state: RoleState, { params }) => {
        params.select = "*,role_node_constraint!role_id(*)";
      },
      onSuccess: (state: RoleState, res: AxiosResponse<Role[]>) => {
        const roles = Object.fromEntries(
          res.data.map((role: Role) => [role.id, role])
        );
        state.role = roles;
        state.fullFetch = true;
      },
    })
    .get({
      action: "fetchRoleById",
      path: "/role",
      queryParams: true,
      beforeRequest: (state: RoleState, { params }) => {
        params.id = `eq.${params.id}`;
        params.select = "*,role_node_constraint!role_id(*)";
      },
      onSuccess: (
        state: RoleState,
        res: AxiosResponse<Role[]>,
        axios: AxiosInstance,
        actionParams
      ) => {
        state.role = {
          ...state.role,
          ...Object.fromEntries(res.data.map((role: Role) => [role.id, role])),
        };
        if (actionParams.full) {
          state.fullRole = {
            ...state.fullRole,
            ...Object.fromEntries(
              res.data.map((role: Role) => [role.id, true])
            ),
          };
        }
      },
    })
    .post({
      action: "createRoleBase",
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
      beforeRequest: (state: RoleState, actionParams) => {
        const { params, data } = actionParams;
        params.id = data.id;
        actionParams.data = filterKeys(data, rolePatchKeys);
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
    .delete({
      action: "deleteRole",
      path: ({ id }) => `/role?id=eq.${id}`,
    })

    .post({
      action: "createRoleNodeConstraintBase",
      path: "/role_node_constraint",
      onSuccess: (
        state: RoleState,
        res: AxiosResponse<RoleNodeConstraint[]>,
        axios: AxiosInstance,
        { data }
      ) => {
        const rnc = res.data[0];
        const role = state.role[rnc.role_id];
        const role_node_constraint = role.role_node_constraint;
        role_node_constraint.push(rnc);
        state.role[rnc.role_id] = { ...role, role_node_constraint };
      },
    })
    .patch({
      action: "updateRoleNodeConstraintBase",
      path: ({ role_id, node_type }) =>
        `/role_node_constraint?role_id=eq.${role_id}&node_type=eq.${node_type}`,
      beforeRequest: (state: RoleNodeConstraintState, { params, data }) => {
        params.role_id = data.role_id;
        params.node_type = data.node_type;
        data.slug = undefined;
        Object.assign(data, {
          updated_at: undefined,
          role_node_constraint: undefined,
        });
      },
    })
    .delete({
      action: "deleteRoleNodeConstraintBase",
      path: ({ role_id, node_type }) =>
        `/role_node_constraint?role_id=eq.${role_id}&node_type=eq.${node_type}`,
      beforeRequest: (state: RoleNodeConstraintState, { params, data }) => {
        params.role_id = data.role_id;
        params.node_type = data.node_type;
        data.slug = undefined;
        Object.assign(data, {
          updated_at: undefined,
          role_node_constraint: undefined,
        });
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
/*
type RoleRestActionTypes = {
  fetchRoles: RestEmptyActionType<Role[]>;
  fetchRoleById: ({
    full,
    params,
  }: {
    full?: boolean;
    params: { id: number };
  }) => Promise<AxiosResponse<Role>>;
  createRoleBase: RestDataActionType<Partial<Role>, Role[]>;
  updateRole: RestDataActionType<Partial<Role>, Role[]>;
  deleteRole: RestDataActionType<Partial<Role>, Role[]>;
  createRoleNodeConstraintBase: RestDataActionType<
    Partial<RoleNodeConstraint>,
    RoleNodeConstraint[]
  >;
  updateRoleNodeConstraintBase: RestDataActionType<
    Partial<RoleNodeConstraint>,
    RoleNodeConstraint[]
  >;
  deleteRoleNodeConstraintBase: RestDataActionType<
    Partial<RoleNodeConstraint>,
    RoleNodeConstraint[]
  >;
};

export type RoleActionTypes = RetypeActionTypes<typeof RoleActions> &
  RoleRestActionTypes;
export type RoleGetterTypes = RetypeGetterTypes<typeof RoleGetters>;
*/
