<template>
  <div>
    <q-card class="q-mt-md q-pa-md">
      <q-select
        style="width: 60%"
        clearable
        filled
        class="q-pt-md"
        v-model="newRoleNodeConstraint.node_type"
        label="Node Type"
        :options="ibis_node_type"
      ></q-select>
      <q-select
        style="width: 60%"
        clearable
        filled
        class="q-pt-md"
        v-model="newRoleNodeConstraint.max_pub_state"
        label="Max Publish State"
        :options="publication_state"
      ></q-select>
      <q-btn
        class="q-mt-xl q-ma-md"
        label="Add"
        @click="addRoleNodeConstraint(newRoleNodeConstraint)"
      ></q-btn>
    </q-card>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import { RoleNodeConstraint, Role } from "../types";
import { Prop } from "vue/types/options";
import { publication_state_enum, ibis_node_type_enum } from "../enums";

const RoleNodeConstraintCardProps = Vue.extend({
  props: {
    roleNodeConstraint: Object as Prop<RoleNodeConstraint>,
  },
});

@Component<RoleNodeConstraintCard>({
  data() {
    return { newRoleNodeConstraint: {} };
  },
  computed: {},
  methods: {},

  beforeMount() {
    this.newRoleNodeConstraint = this.roleNodeConstraint;
  },
})
export default class RoleNodeConstraintCard extends RoleNodeConstraintCardProps {
  publication_state = Object.keys(publication_state_enum);
  ibis_node_type = Object.keys(ibis_node_type_enum);

  addRoleNodeConstraint(newRoleNodeConstraint) {
    this.$emit("addRoleNodeConstraint", newRoleNodeConstraint);
  }
}
</script>
