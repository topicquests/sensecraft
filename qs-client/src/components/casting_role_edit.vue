<template>
  <q-select
    id="test"
    v-model="availableRoles.name"
    :options="availableRoles"
    option-label="name"
    option-value="id"
    emit-value
    map-options
    label="memberName"
  ></q-select>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { CastingRole, GuildMemberAvailableRole, Member } from "../types";

const CastingRoleEditProps = Vue.extend({
  props: {},
});

@Component<CastingRoleEdit>({
  name: "CastingRoleEdit",
  computed: {},
  watch: {},
})
export default class CastingRoleEdit extends CastingRoleEditProps {
  role: Array<CastingRole> = [];
  availableRoles: Array<GuildMemberAvailableRole> = [];
  member: Partial<Member> = {};
}
</script>
