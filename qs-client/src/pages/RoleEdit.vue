<template>
  <q-page padding>
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="row justify-center">
      <h3>Edit Role</h3>
    </div>
    <div class="row justify-center">
      <role-card
        v-bind:role="getRoleById(role_id)"
        v-bind:edit="true"
        v-on:updateCurrentRole="updateCurrentRole"
        v-on:deleteRoleById="deleteRoleById"
      ></role-card>
      <div class="col-4 q-ml-md">
        <div>
          <role-node-constraint-card
            v-bind:roleNodeConstraint="newRoleNodeConstraintCard"
            v-on:addRoleNodeConstraint_="addRoleNodeConstraint_"
            v-on:updateRoleNodeConstraint_="updateRoleNodeConstraint_"
            v-on:deleteRoleNodeConstraint_="deleteRoleNodeConstraint_"
          ></role-node-constraint-card>
        </div>
      </div>
    </div>
    <div class="row justify-center">
      <span class="q-pt-lg" style="font-size: 2em">Role Node Constraints</span>
    </div>
    <div class="row justify-center q-mt-xs q-pt-none">
      <div class="col-6 q-pa-none">
        <role-node-constraint-table
          v-bind:role="getRoleById(role_id)"
          v-on:editRoleNodeConstraint="editRoleNodeConstraint"
        ></role-node-constraint-table>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import roleCard from "../components/role-card.vue";
import { mapActions, mapGetters } from "vuex";
import { RoleActionTypes, RoleGetterTypes } from "../store/role";
import { BaseGetterTypes } from "../store/baseStore";
import { Role, RoleNodeConstraint } from "src/types";
import RoleNodeConstraintTable from "src/components/role-node-constraint-table.vue";
import RoleNodeConstraintCard from "src/components/role-node-constraint-card.vue";

@Component<RoleEditPage>({
  components: {
    scoreboard: scoreboard,
    member: member,
    roleCard: roleCard,
    roleNodeConstraintTable: RoleNodeConstraintTable,
    roleNodeConstraintCard: RoleNodeConstraintCard,
  },
  computed: {
    ...mapGetters("role", [
      "getRoleById",
      "getRoleNodeConstraintsByRoleId",
      "getRoleNodeConstraintByType",
    ]),
  },
  methods: {
    ...mapActions("role", [
      "ensureRole",
      "updateRole",
      "deleteRole",
      "ensureAllRoles",
      "fetchRoles",
      "createRoleNodeConstraint",
      "updateRoleNodeConstraint",
      "deleteRoleNodeConstraint",
    ]),
  },
})
export default class RoleEditPage extends Vue {
  name: "RoleEdit";
  newRoleNodeConstraint: Boolean = false;
  role_id: number;
  isAdmin: Boolean = false;
  newRoleNodeConstraintCard: Partial<RoleNodeConstraint> = {
    node_type: "question",
    max_pub_state: "published",
  };

  // Declare computed attributes for typescript
  hasPermission!: BaseGetterTypes["hasPermission"];
  getRoleById!: RoleGetterTypes["getRoleById"];
  getRoleNodeConstraintsByRoleId!: RoleGetterTypes["getRoleNodeConstraintsByRoleId"];
  getRoleNodeConstraintByType!: RoleGetterTypes["getRoleNodeConstraintByType"];
  ensureRole!: RoleActionTypes["ensureRole"];
  ensureAllRoles: RoleActionTypes["ensureAllRoles"];
  fetchRoles: RoleActionTypes["fetchRoles"];
  updateRole!: RoleActionTypes["updateRole"];
  deleteRole: RoleActionTypes["deleteRole"];
  createRoleNodeConstraint: RoleActionTypes["createRoleNodeConstraint"];
  updateRoleNodeConstraint: RoleActionTypes["updateRoleNodeConstraint"];
  deleteRoleNodeConstraint: RoleActionTypes["deleteRoleNodeConstraint"];

  async updateCurrentRole(role) {
    try {
      const res = await this.updateRole({ data: role });
      await this.fetchRoles();
      this.$q.notify({
        message: `role updated`,
        color: "positive",
      });
    } catch (err) {
      console.log("there was an error in updating role ", err);
      this.$q.notify({
        message: `There was an error updating role.`,
        color: "negative",
      });
    }
  }

  async deleteRoleById(role: Role) {
    try {
      const res = await this.deleteRole({ params: { id: role.id }, data: {} });
      await this.fetchRoles();
      this.$q.notify({
        message: `role deleted`,
        color: "positive",
      });
    } catch (err) {
      console.log("there was an error in deleting role ", err);
      this.$q.notify({
        message: `There was an error deleting role.`,
        color: "negative",
      });
    }
  }

  async addRoleNodeConstraint_(roleNodeConstraint: RoleNodeConstraint) {
    roleNodeConstraint.role_id = this.role_id;
    await this.createRoleNodeConstraint({ data: roleNodeConstraint });
    this.newRoleNodeConstraintCard = await this.getRoleNodeConstraintsByRoleId(
      this.role_id
    )[0];
  }
  async updateRoleNodeConstraint_(roleNodeConstraint: RoleNodeConstraint) {
    roleNodeConstraint.role_id = this.role_id;
    await this.updateRoleNodeConstraint({
      params: {
        role_id: this.role_id,
        node_type: roleNodeConstraint.node_type,
      },
      data: { role_id: this.role_id, node_type: roleNodeConstraint.node_type },
    });
    this.newRoleNodeConstraintCard = await this.getRoleNodeConstraintsByRoleId(
      this.role_id
    )[0];
  }
  async deleteRoleNodeConstraint_(roleNodeConstraint: RoleNodeConstraint) {
    roleNodeConstraint.role_id = this.role_id;
    await this.deleteRoleNodeConstraint({
      params: {
        role_id: this.role_id,
        node_type: roleNodeConstraint.node_type,
      },
      data: { role_id: this.role_id, node_type: roleNodeConstraint.node_type },
    });
  }

  async editRoleNodeConstraint(roleNodeConstraint: {}) {
    this.newRoleNodeConstraintCard = roleNodeConstraint[0];
    console.log("Edit Role Constraint", roleNodeConstraint[0]);
    this.newRoleNodeConstraint = true;
  }

  async beforeMount() {
    this.role_id = Number.parseInt(this.$route.params.role_id);
    await this.ensureRole({ role_id: this.role_id });
    await this.ensureAllRoles;
  }
}
</script>
