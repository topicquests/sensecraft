<template>
  <q-page class="role-page">
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="col">
      <div class="row justify-center">
        <h2>Create Role</h2>
      </div>
      <div class="col">
        <div class="row justify-center">
          <role-card
            :role="newRole"
            :edit="false"
            v-on:createNewRole="createNewRole"
          >
          </role-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue';
import scoreboard from '../components/score-board.vue';
import member from '../components/member-handle.vue';
import roleCard from '../components/role-card.vue';
import { Role } from '../types';
import { useRoleStore } from '../stores/role';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const roleStore = useRoleStore();
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const newRole: Partial<Role> = {
  name: '',
  permissions: [],
  max_pub_state: undefined,
  guild_id: undefined,
};

async function createNewRole(newRole: Partial<Role>) {
  try {
    const res = await roleStore.createRole(newRole);
    $q.notify({
      message: `Added new role`,
      type: 'positive',
    });
    console.log('Role id: ', res.id);
    await router.push({ name: 'role_edit', params: { role_id: res.id } });
  } catch (err) {
    console.log('there was an error in creating role ', err);
    $q.notify({
      message: `There was an error creating new role.`,
      type: 'negative',
    });
  }
}

onBeforeMount(() => {
  if (typeof route.params.guild_id === 'string') {
    newRole.guild_id = Number.parseInt(route.params.guild_id);
  }
});
</script>

<style scoped>
.role-page {
  background: var(--sc-color-bg-muted);
  min-height: 100vh;
}
</style>
