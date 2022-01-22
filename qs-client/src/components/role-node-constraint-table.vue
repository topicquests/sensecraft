<template>
  <div
    v-if="
      roleNodeConstraint &&
      getRoleNodeConstraintsByRoleId(roleNodeConstraint.id).length
    "
  >
    <q-table
      :title="title"
      :data="roleNodeConstraint.role_node_constraint"
      :columns="columns"
    >
      <template slot="body" slot-scope="props">
        <q-tr :props="props">
          <q-td key="node_type" :props="props"> {{ props.row.node_type }}</q-td>
          <q-td key="publish_state" :props="props">{{
            props.row.max_pub_state
          }}</q-td>
          <q-td key="roleId" auto-width :props="props">
            <q-btn label="edit" @click="editRoleNodeConstraint"></q-btn>
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
import { RoleNodeConstraint } from "../types";

const RoleNodeConstraintTableProps = Vue.extend({
  props: {
    roleNodeConstraint: Object as Prop<Role>,
    title: String,
  },
});
@Component<RoleNodeConstraintTable>({
  name: "RoleNodeConstraintTable",
  computed: {
    ...mapGetters("role", ["getRoleNodeConstraintsByRoleId"]),
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

  created() {}

  editRoleNodeConstraint() {}
}
</script>
