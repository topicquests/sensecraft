<template>
  <div>
    <q-card class="card">
      <section>
        <div class="row justify-center">
          <H2 class="q-ml-lg q-mr-lg">Change casting role </H2>
        </div>
      </section>
      <q-separator color="grey" class="q-mb-md"></q-separator>
      <p class="note">Can only be changed prior to start of quest</p>

      <div class="row">
        <span class="handle q-pl-md q-mt-md">
          {{ memberStore.member.handle }}
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

<script setup lang="ts">
import { useMemberStore } from "src/stores/member";
import { Role } from "../types";
import { watchEffect } from "vue";

const CastingRoleEditProps = defineProps<{
    availableRoles: Role[];
    castingRoles: Role[];
    questId: number | undefined;
    guildId: number | undefined;
}>();

const memberStore = useMemberStore();
let cr: Role[] = [];
const emit = defineEmits(['castingRoleAdd','castingRoleRemove']);

watchEffect(() => {
  cr = [...CastingRoleEditProps.castingRoles];
})

function castingRoleAdd(role_id: number) {
  emit("castingRoleAdd", role_id);
}

function castingRoleRemove(role: Role) {
  emit("castingRoleRemove", role.id);
};
</script>
<style>
H5 {
  margin-top: 3%;
  margin-bottom: 3%;
}
.handle {
  font-size: 20px;
  color: royalblue;
  padding-bottom: 2em;
}
.card {
  background: white;
}
.note {
  font-size: 15px;
  background: white;
  text-align: center;
  color: black;
  padding-left: 1em;
  padding-right: 1em;
}
</style>
