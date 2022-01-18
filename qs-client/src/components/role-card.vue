<template>
  <q-card class="q-pa-lg" style="width: 20%">
    <q-input
      style="width: 40%"
      v-model="currentRole.name"
      label="Name"
      type="string"
    ></q-input>
    <q-select
      style="width: 80%"
      class="q-pt-md"
      v-model="currentRole.permissions"
      :multiple="false"
      label="Permission"
      :options="permissions"
    ></q-select>
    <q-select
      style="width: 40%"
      class="q-pt-md"
      v-model="currentRole.max_pub_state"
      label="Max Publish State"
      :options="publication_state"
    ></q-select>
    <q-input
      style="width: 30%"
      class="q-pt-md"
      v-model="currentRole.guild_id"
      label="Guild id"
    ></q-input>
    <div class="row justify-start q-pt-md q-pb-lg">
      <q-btn
        label="Submit"
        @click="doSubmit"
        color="primary"
        class="q-mr-md q-ml-md"
      />
      <q-btn label="Cancel" @click="$router.push({ name: 'home' })" />
    </div>
  </q-card>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import { Role } from "../types";
import { Prop } from "vue/types/options";
import {
  permission_enum,
  publication_state_enum,
  permission_list,
} from "../enums";

const RoleCardProps = Vue.extend({
  props: { role: {} as Prop<Role> },
});

@Component<RoleCard>({
  name: "RoleCard",
})
export default class RoleCard extends RoleCardProps {
  currentRole: Role;
  permissions = permission_list;
  publication_state = Object.keys(publication_state_enum);

  created() {
    this.currentRole = this.role;
  }
  doSubmit() {
    console.log(this.currentRole);
  }
}
</script>
