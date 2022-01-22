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
    <div class="col">
      <div class="row justify-center">
        <h3>Edit Role</h3>
      </div>
      <div class="col">
        <div class="row justify-center">
          <role-card
            v-bind:role="getRoleById(role_id)"
            v-bind:edit="true"
            v-on:updateCurrentRole="updateCurrentRole"
            v-on:deleteRoleById="deleteRoleById"
          ></role-card>
          <div class="col-4 q-ml-md">
            <q-btn
              label="add role node constraint"
              @click="newRoleNodeConstraint = true"
            >
            </q-btn>
            <div v-if="newRoleNodeConstraint">
              <role-node-constraint-card
                v-bind:roleNodeConstraint="newRoleNodeConstraintCard"
                v-on:addRoleNodeConstraint="addRoleNodeConstraint"
              ></role-node-constraint-card>
            </div>
          </div>
        </div>
        <div class="row justify-center">
          <span class="q-pt-lg" style="font-size: 2em"
            >Role Node Constraints</span
          >
        </div>
        <div class="row justify-center q-mt-xs q-pt-none">
          <div class="column items-center">
            <div class="col-8 q-pa-none">
              <role-node-constraint-table
                v-bind:roleNodeConstraint="getRoleById(role_id)"
              ></role-node-constraint-table>
            </div>
          </div>
        </div>
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
    ...mapGetters("role", ["getRoleById", "getRoleNodeConstraintsByRoleId"]),
  },
  methods: {
    ...mapActions("role", [
      "ensureRole",
      "updateRole",
      "deleteRole",
      "ensureAllRoles",
      "fetchRoles",
      "createRoleNodeConstraint",
    ]),
  },
})
export default class RoleEditPage extends Vue {
  name: "RoleEdit";
  newRoleNodeConstraint: Boolean = false;
  role_id: number;
  isAdmin: Boolean = false;
  newRoleNodeConstraintCard: Partial<RoleNodeConstraint> = {};

  // Declare computed attributes for typescript
  hasPermission!: BaseGetterTypes["hasPermission"];
  getRoleById!: RoleGetterTypes["getRoleById"];
  getRoleNodeConstraintsByRoleId!: RoleGetterTypes["getRoleNodeConstraintsByRoleId"];
  ensureRole!: RoleActionTypes["ensureRole"];
  ensureAllRoles: RoleActionTypes["ensureAllRoles"];
  fetchRoles: RoleActionTypes["fetchRoles"];
  updateRole!: RoleActionTypes["updateRole"];
  deleteRole: RoleActionTypes["deleteRole"];
  createRoleNodeConstraint: RoleActionTypes["createRoleNodeConstraint"];

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

  async addRoleNodeConstraint(roleNodeConstraint: RoleNodeConstraint) {
    roleNodeConstraint.role_id = this.role_id;
    await this.createRoleNodeConstraint({ data: roleNodeConstraint });
    const rnc = await this.getRoleNodeConstraintsByRoleId(this.role_id);
    console.log("role node consriant", rnc);
  }

  async beforeMount() {
    this.role_id = Number.parseInt(this.$route.params.role_id);
    await this.ensureRole({ role_id: this.role_id });
    await this.ensureAllRoles;
    console.log("Role", this.getRoleById(this.role_id));
  }
}
</script>
