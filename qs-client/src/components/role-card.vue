<template>
  <div class="col-4">
    <q-card class="q-pa-lg" style="width: 100%">
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
        :options="permission_list"
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
          v-if="!edit"
          label="Create"
          @click="createNewRole()"
          color="primary"
          class="q-mr-md q-ml-md"
        />
        <q-btn
          v-if="edit"
          label="update"
          @click="updateCurrentRole()"
          color="primary"
          class="q-mr-md q-ml-md"
        />
        <q-btn label="Cancel" @click="$router.push({ name: 'home' })" />
      </div>
    </q-card>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Vue from "vue";
import { Role } from "../types";
import { Prop } from "vue/types/options";
import { publication_state_enum, permission_list } from "../enums";

const RoleCardProps = Vue.extend({
  props: { role: {} as Prop<Role>, edit: Boolean },
});

@Component<RoleCard>({
  name: "RoleCard",

  computed: {},
})
export default class RoleCard extends RoleCardProps {
  currentRole: Role;

  permission_list = permission_list;
  publication_state = Object.keys(publication_state_enum);

  created() {
    this.currentRole = this.role;
  }
  createNewRole() {
    this.$emit("createNewRole", this.currentRole);
  }
  updateCurrentRole() {
    this.$emit("updateCurrentRole", this.currentRole);
  }
}
</script>
