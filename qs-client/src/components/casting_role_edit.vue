<template>
  <div>
    <q-card class="card">
      <section>
      <div class="row justify-center">
        <H5 class="q-ml-lg q-mr-lg">Change casting role </H5>
      </div>
      </section>
      <q-separator color="grey" class="q-mb-md" ></q-separator>
      <p>Can only be changed prior to start of quest</p>

      <div class="row">
        <span class="handle q-pl-md q-mt-md">
          {{ member.handle }}
        </span>
        <q-select
          class="q-ml-md q-mt-xs"
          style="width: 50%"
          :multiple="true"
          v-model="cr"
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
    castingRoles: Array as Prop<Role[]>,
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
  cr: Role[];
  member: MemberState["member"];
  memberId: number;

  created() {
    this.cr = [...this.castingRoles];
  }

  castingRoleAdd(role_id: number) {
    this.$emit("castingRoleAdd", role_id);
  }

  castingRoleRemove(role: Role) {
    this.$emit("castingRoleRemove", role.id);
  }
}
</script>
<style>
H5 {
  color:blue;
  margin-top: 3%;
  margin-bottom: 3%;
  text-decoration-line: underline;
}
.handle {
  font-size: 20px;
  color: royalblue;
  padding-bottom: 2em;
}
.card {
  background:white;
}
p {
  font-size: 15px;
  background:white;
  text-align: center;
  color: black;
  padding-left: 1em;
  padding-right: 1em;
}
</style>
