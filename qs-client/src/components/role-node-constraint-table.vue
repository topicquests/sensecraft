<template>
  <div v-if="role">
    <q-table
      :title="title"
      :data="role.role_node_constraint"
      :columns="columns"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="node_type" :props="props"> {{ props.row.node_type }}</q-td>
          <q-td key="publish_state" :props="props">{{
            props.row.max_pub_state
          }}</q-td>
          <q-td key="roleId" auto-width :props="props">
            <q-btn
              label="edit"
              @click="
                editRoleNodeConstraint(props.row.role_id, props.row.node_type)
              "
            ></q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
  <div v-else>
    <span>There are no role node constraints</span>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue/types/options";
import { Role } from "../types";
import { mapGetters } from "vuex";
// import { RoleNodeConstraint } from "../types";
import { RoleGetterTypes } from "src/store/role";

const RoleNodeConstraintTableProps = Vue.extend({
  props: {
    role: Object as Prop<Role>,
    title: String,
  },
});
@Component<RoleNodeConstraintTable>({
  name: "RoleNodeConstraintTable",
  computed: {
    ...mapGetters("role", [
      "getRoleNodeConstraintsByRoleId",
      "getRoleNodeConstraintByType",
    ]),
  },
})
export default class RoleNodeConstraintTable extends RoleNodeConstraintTableProps {
  columns = [
    {
      name: "node_type",
      required: true,
      label: "Node Type",
      align: "left",
      field: "node_type",
      sortable: true,
    },
    {
      name: "publish_state",
      required: true,
      label: "Max Publish State",
      align: "left",
      field: "max_pub_state",
      sortable: true,
    },
    {
      name: "roleId",
      required: false,
      label: "Action",
      align: "left",
      field: "role_id",
      sortable: true,
    },
  ];

  getRoleNodeConstraintByType!: RoleGetterTypes["getRoleNodeConstraintByType"];

  async editRoleNodeConstraint(roleId: number, node_type: string) {
    const roleConstraint = await this.getRoleNodeConstraintByType(
      roleId,
      node_type
    );
    this.$emit("editRoleNodeConstraint", roleConstraint);
  }
}
</script>
