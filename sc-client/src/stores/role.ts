import { filterKeys } from './baseStore';
import { defineStore } from 'pinia';
import { AxiosResponse } from 'axios';
import { Role, RoleNodeConstraint, rolePatchKeys } from '../types';
import { api } from '../boot/axios';

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
  role: {},
  fullFetch: false,
  fullRole: {},
};

export const useRoleStore = defineStore('role', {
  state: () => baseState,

  getters: {
    getRoleById: (state: RoleState) => (id: number) => state.role[id],
    getRoleByName:
    (state: RoleState) =>
    (id: number, name: string): Role | undefined =>
      Object.values(state.role).find((role) => role.name === name),
    getRoles: (state: RoleState) =>
      Object.values(state.role).sort((a, b) => a.name.localeCompare(b.name)),
    getRoleNodeConstraintsByRoleId: (state: RoleState) => (id: number) =>
      state.role[id].role_node_constraint,
    getRoleNodeConstraintByType:
      (state: RoleState) => (id: number, node_type: string) => {
        const roleNodeConstraint: RoleNodeConstraint[] = state.role[id]?.role_node_constraint?.filter(
          (node: RoleNodeConstraint) => node.node_type === node_type,
        ) ?? [];
        return roleNodeConstraint;
      },
  },
  actions: {
    async ensureAllRoles() {
      if (Object.keys(this.role).length == 0 || !this.fullFetch) {
        await this.fetchRoles();
      }
    },
    async ensureRole({
      role_id,
      full = true,
    }: {
      role_id: number;
      full?: boolean;
    }) {
      if (
        this.getRoleById(role_id) === undefined ||
        (full && !this.fullRole[role_id])
      ) {
        await this.fetchRoleById(role_id, full);
      }
    },
    async createRole(data: Partial<Role>): Promise<Partial<Role>> {
      console.log('Creating role with data:', data);
      try {
        const res:Role = await this.createRoleBase(data);
        console.log('Role created successfully:', res);
        await this.fetchRoles();
        return res;
      } catch (error) {
        console.error('Error in createRole:', error);
        throw error;
      }
    },

    resetRole() {
      Object.assign(this, baseState);
    },
    async createRoleNodeConstraint(
      data: RoleNodeConstraint,
    ): Promise<RoleNodeConstraint> {
      const res = await this.createRoleNodeConstraintBase(data);
      await this.fetchRoles();
      return res;
    },
    async updateRoleNodeConstraint(
      data: RoleNodeConstraint,
    ): Promise<RoleNodeConstraint> {
      const res: RoleNodeConstraint =
        await this.updateRoleNodeConstraintBase(data);
      await this.fetchRoles();
      return res;
    },
    async deleteRoleNodeConstraint(data: RoleNodeConstraint) {
      await this.deleteRoleNodeConstraintBase(data);
      await this.fetchRoles();
    },

    async fetchRoles() {
      const params = Object();
      params.select = '*,role_node_constraint!role_id(*)';
      const res: AxiosResponse<Role[]> = await api.get('/role', { params });
      if (res.status == 200) {
        const roles = Object.fromEntries(
          res.data.map((role: Role) => [role.id, role]),
        );
        this.role = roles;
        this.fullFetch = true;
      }
    },
    async fetchRoleById(
      id: number | Array<number>,
      full: boolean = true,
    ): Promise<Role[]> {
      const params = Object();
      if (Array.isArray(id)) {
        params.id = `in(${id.join(',')})`;
      } else {
        params.id = `eq.${id}`;
      }
      params.select = '*,role_node_constraint!role_id(*)';
      const res: AxiosResponse<Role[]> = await api.get('role', {
        params,
      });
      if (res.status == 200) {
        this.role = {
          ...this.role,
          ...Object.fromEntries(res.data.map((role: Role) => [role.id, role])),
        };
        if (full) {
          this.fullRole = {
            ...this.fullRole,
            ...Object.fromEntries(
              res.data.map((role: Role) => [role.id, true]),
            ),
          };
        }
      }
      return res.data;
    },
    async createRoleBase(data: Partial<Role>): Promise<Role> {
      const res: AxiosResponse<Role> = await api.post('/role', data);
      if (res.status == 200) {
        const role = res.data;
        if (typeof role.id == 'number')
          this.role = { ...this.role, [role.id]: role };
      }
      return res.data;
    },
    async updateRole(data: Partial<Role>) {
      const params = Object();
      params.id = data.id;
      data = filterKeys(data, rolePatchKeys);
      const res: AxiosResponse<Role[]> = await api.patch(
        `/role?id=eq.${params.id}`,
        data,
      );
      if (
        res.status === 200 &&
        Array.isArray(res.data) &&
        res.data.length > 0
      ) {
        const role = res.data[0];
        if (role.id != null) {
          this.role = { ...this.role, [role.id]: role };
          this.fullRole = { ...this.fullRole!, [role.id]: true };
        }
      }
    },

    async deleteRole(id: number): Promise<void> {
      const res: AxiosResponse = await api.delete(`roles/${id}`);
      if (res.status === 204) {
        console.log(`Role with ID ${id} deleted successfully.`);
      } else {
        console.error(`Failed to delete role with ID ${id}.`);
      }
    },
    async createRoleNodeConstraintBase(
      data: Partial<RoleNodeConstraint>,
    ): Promise<RoleNodeConstraint> {
      const res: AxiosResponse<RoleNodeConstraint[]> = await api.post(
        '/role_node_constraint',
        data,
      );
      if (res.status == 200) {
        const rnc = res.data[0];
        const role = this.role[rnc.role_id];
        const role_node_constraint = role.role_node_constraint;
        role_node_constraint!.push(rnc);
        this.role[rnc.role_id] = { ...role, role_node_constraint };
      }
      return res.data[0];
    },
    async updateRoleNodeConstraintBase(
      data: RoleNodeConstraint,
    ): Promise<RoleNodeConstraint> {
      const params = Object();
      params.role_id = data.role_id;
      params.node_type = data.node_type;
      Object.assign(data, {
        updated_at: undefined,
        role_node_constraint: undefined,
      });
      const res: AxiosResponse<RoleNodeConstraint[]> = await api.patch(
        '/role_node_constraint',
      );
      if (res.status == 200) {
        console.log('update updateRoleNodeConstraintBase successful');
      }
      return res.data[0];
    },
    async deleteRoleNodeConstraintBase(data: RoleNodeConstraint) {
      const { role_id, node_type } = data;
      const params = {
        role_id,
        node_type,
      }
      Object.assign(data, {
        updated_at: undefined,
        role_node_constraint: undefined,
      });
      //`/role_node_constraint?role_id=eq.${role_id}&node_type=eq.${node_type}`,
      const res: AxiosResponse<RoleNodeConstraint[]> = await api.delete(
        '/role_node_constraint',
        {
          params,
        },
      );
      if (res.status == 200) {
        console.log('deleteRoleNodeConstraintBase successful');
      }
    },
  },
});
