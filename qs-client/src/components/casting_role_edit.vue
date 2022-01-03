<template>
  <div>
    <span>Curennt Roles {{ castingRole }}</span>
    <q-select
      :multiple="true"
      v-model="role.name"
      @add="
        (details) => {
          castingRoleAdd(details.value);
        }
      "
      @remove="
        (details) => {
          castingRoleRemove(details.value);
        }
      "
      :options="availableRoles"
      option-label="name"
      option-value="id"
      emit-value
      map-options
    ></q-select>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { CastingRole, GuildMemberAvailableRole, Member } from "../types";
import { Prop } from "vue/types/options";
import { Role } from "../types";

const CastingRoleEditProps = Vue.extend({
  props: {
    availableRoles: Array as Prop<Role[]>,
    castingRole: String,
    questId: Number,
    guildId: Number,
    memberId: Number,
  },
});

@Component<CastingRoleEdit>({
  name: "CastingRoleEdit",
  computed: {},
  watch: {},
})
export default class CastingRoleEdit extends CastingRoleEditProps {
  role = [];
  cr = [];

  created() {
    this.role = { ...this.availableRoles };
  }

  castingRoleAdd(role_id: number) {
    this.$emit("castingRoleAdd", this.memberId, role_id);
  }

  castingRoleRemove(role_id: number) {
    this.$emit("castingRoleRemove", this.memberId, role_id);
  }
}
</script>
