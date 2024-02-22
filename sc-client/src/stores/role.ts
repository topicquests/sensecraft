import { filterKeys } from './baseStore';
import { defineStore } from 'pinia';
import { AxiosResponse} from 'axios';
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
          (node: RoleNodeConstraint) => node.node_type == node_type,
        );
        return roleNodeConstraint;
      },
  },
  actions: {
    async  ensureAllRoles() {
      if (this.role.length === 0 || !this.fullFetch) {
        await this.fetchRoles();
      }
    },
    async ensureRole(
      { role_id, full = true }: { role_id: number; full?: boolean },
    ) {
      if (
        this.getRoleById(role_id) === undefined ||
        (full && !this.fullRole[role_id])
      ) {
        await fetchRoleById({
          full,
          id: role_id,
        });
      }
    },
    async createRole ({ data }) {
      const res = await createRoleBase({ data });
      await this.fetchRoles();
      return res.data[0];
    },
    resetRole() {
      Object.assign(this, baseState);
    },
    async createRoleNodeConstraint({ data }) {
      await createRoleNodeConstraintBase({
        data,
      });
      await this.fetchRoles();
    },
    async updateRoleNodeConstraint({ data }) {
      await updateRoleNodeConstraintBase({
        data,
      });
      await this.fetchRoles();
    },
    async deleteRoleNodeConstraint({ data }) {
      await deleteRoleNodeConstraintBase({
        data,
      });
      await this.fetchRoles();
    },
    
    async fetchRoles() {
      const params = Object();
      params.select = '*,role_node_constraint!role_id(*)';
      const res:AxiosResponse<Role[]> = await api.get('/role', {params})
      if (res.status == 200) {
        const roles = Object.fromEntries(
          res.data.map((role: Role) => [role.id, role])
        );
        this.role = roles;
        this.fullFetch = true;
      }
    },
    async fetchRoleById (
      id: number | Arra<number>,
      full: boolean = true,
    ): Promise<Role[]> {
      const params = Object();
      if(Array.isArray(id)) {
        params.id = `in(${id.join(',')})`;
      } else {
        params.id = `eq.${id}`;
      }
      params.select = '*,role_node_constraint!role_id(*)';
      const res:AxiosResponse<Role[]> = await api.get('role', {
        params
      })
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
    },
    async createRoleBase( data: Partial<Role> ): Promise<void>  {
      const res:AxiosResponse<Role[]> = await api.post('/role', {
        data
      })
      if ( res.status==200) {
        const role = res.data[0];
        this.role = { ...this.role, [role.id]: role };  
      }
    },
    async updateRole(data: Partial<Role>, params) {
      params.data = filterKeys(data, rolePatchKeys);
      params = {
        id: `eq.${data.id}`
      };
      const res: AxiosResponse<Role[]> = await api.patch('/role', data, {
        params,
      });
      if (res.status==200) {
        let role = res.data[0];
        role = Object.assign({}, this.role[role.id], role);
        this.role = { ...this.role, [role.id]: role };
      }
    },

  async deleteRole({ params }): Promise<void> {

      const res: AxiosResponse = await api.delete(`roles/${params.id}`);
      if (res.status === 204) {
        console.log(`Role with ID ${params.id} deleted successfully.`);
      } else {
        console.error(`Failed to delete role with ID ${params.id}.`);
      }
    },
    async createRoleNodeConstraintBase({data}) {
      const res:AxiosResponse<RoleNodeConstraint[]> = api.post('/role_node_constraint', data.RoleNodeConstraint) 
      if (res.status==200) {
        const rnc = res.data[0];
        const role = this.role[rnc.role_id];
        const role_node_constraint = role.role_node_constraint;
        role_node_constraint.push(rnc);
        this.role[rnc.role_id] = { ...role, role_node_constraint };
      }
    },
    async updateRoleNodeConstraintBase(params, data) {
      params.role_id = data.role_id;
        params.node_type = data.node_type;
        data.slug = undefined;
        Object.assign(data, {
          updated_at: undefined,
          role_node_constraint: undefined,
        });
      const res:AxiosResponse<RoleNodeConstraint[]> = api.patch('/role_node_constraint')
      if (res==200) {
        console.log("update updateRoleNodeConstraintBase successful");
      }
    },
    async deleteRoleNodeConstraintBase(data) {
      const { role_id, node_type } = data;
      params= {
        role_id,
        node_type,
      }
      data.slug = undefined;
      Object.assign(data, {
        updated_at: undefined,
        role_node_constraint: undefined,
      });
       //`/role_node_constraint?role_id=eq.${role_id}&node_type=eq.${node_type}`,
      const res:AxiosResponse<RoleNodeConstraint[]> = await api.delete('/role_node_constraint', {
        params
      })
      if(res==200) {
        console.log ("deleteRoleNodeConstraintBase successful")
      }
    },
  }
});