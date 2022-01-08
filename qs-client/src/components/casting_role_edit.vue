<template>
  <div>
    <q-card>
      <div class="row justify-center">
        <H5 class="q-ml-lg q-mr-lg">Change casting role </H5>
      </div>
      <div style="width: 100%">
        <div class="row">
          <span class="q-ml-md">Curennt Roles: {{ castingRole }}</span>
        </div>
        <div class="row">
          <span class="q-pl-md q-pt-md">
            {{ member.handle }}
          </span>
          <q-select
            class="q-ml-md"
            style="width: 40%"
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
      </div>
    </q-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue/types/options";
import { Role } from "../types";
import { mapState } from "vuex";
import { MemberState } from "../store/member";

const CastingRoleEditProps = Vue.extend({
  props: {
    availableRoles: Array as Prop<Role[]>,
    castingRole: String,
    questId: Number,
    guildId: Number,
  },
});

@Component<CastingRoleEdit>({
  name: "CastingRoleEdit",
  computed: {
    ...mapState("member", {
      member: (state: MemberState) => state.member,
      memberId: (state: MemberState) => state.member?.id,
    }),
  },
  watch: {},
})
export default class CastingRoleEdit extends CastingRoleEditProps {
  role = [];
  cr = null;
  member: MemberState["member"];
  memberId: number;

  create() {
    this.role = { ...this.availableRoles };
    this.cr = this.castingRole;
  }

  castingRoleAdd(role_id: number) {
    this.$emit("castingRoleAdd", this.memberId, role_id);
  }

  castingRoleRemove(role_id: number) {
    this.$emit("castingRoleRemove", this.memberId, role_id);
  }
}
</script>
