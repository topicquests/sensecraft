<template>
  <q-page class="role-page" v-if="ready">
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="row justify-center">
      <h3>Edit Role</h3>
    </div>
    <div class="row justify-center">
      <role-card
        :role="role"
        :edit="true"
        v-on:updateCurrentRole="updateCurrentRole"
        v-on:deleteRoleById="deleteRoleById"
      ></role-card>
      <div class="col-4 q-ml-md">
        <div>
          <role-node-constraint-card
            :roleNodeConstraint="newRoleNodeConstraintCard"
            v-on:addRoleNodeConstraint_="addRoleNodeConstraint_"
            v-on:updateRoleNodeConstraint_="updateRoleNodeConstraint_"
            v-on:deleteRoleNodeConstraint_="deleteRoleNodeConstraint_"
          ></role-node-constraint-card>
        </div>
      </div>
    </div>
    <div class="row justify-center">
      <span class="q-pt-lg" style="font-size: 2em">Role Node Constraints</span>
    </div>
    <div class="row justify-center q-mt-xs q-pt-none">
      <div class="col-6 q-pa-none">
        <role-node-constraint-table
          :role="roleStore.getRoleById(role_id)"
          v-on:editRoleNodeConstraint="editRoleNodeConstraint"
        ></role-node-constraint-table>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue';
import scoreboard from '../components/score-board.vue';
import member from '../components/member-handle.vue';
import { useRoleStore } from '../stores/role';
import { Role, RoleNodeConstraint } from '../types';
import roleCard from 'src/components/role-card.vue';
import roleNodeConstraintCard from 'src/components/role-node-constraint-card.vue';
import roleNodeConstraintTable from 'src/components/role-node-constraint-table.vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';

const roleStore = useRoleStore();
const route = useRoute();
const $q = useQuasar();

const role_id = ref(0);
const ready = ref(false);

const role = computed(() => roleStore.getRoleById(role_id.value) || null);

const newRoleNodeConstraint = ref(false);
let newRoleNodeConstraintCard: Partial<RoleNodeConstraint> = {
  node_type: 'question',
  max_pub_state: 'published',
};

watch(
  role_id,
  async (newRoleId) => {
    if (newRoleId) {
      await roleStore.ensureRole({ role_id: newRoleId });
    }
  },
  { immediate: true },
);

async function updateCurrentRole(role: Partial<Role>) {
  try {
    await roleStore.updateRole(role);
    await roleStore.fetchRoles();
    $q.notify({ message: `Role updated`, color: 'positive' });
  } catch (err) {
    console.error('Error updating role:', err);
    $q.notify({ message: `Error updating role`, color: 'negative' });
  }
}

async function deleteRoleById(role: Role) {
  try {
    await roleStore.deleteRole(role.id);
    await roleStore.fetchRoles();
    $q.notify({ message: `Role deleted`, color: 'positive' });
  } catch (err) {
    console.error('Error deleting role:', err);
    $q.notify({ message: `Error deleting role`, color: 'negative' });
  }
}

async function addRoleNodeConstraint_(constraint: RoleNodeConstraint) {
  constraint.role_id = role_id.value;
  await roleStore.createRoleNodeConstraint(constraint);
}

async function updateRoleNodeConstraint_(constraint: RoleNodeConstraint) {
  constraint.role_id = role_id.value;
  await roleStore.updateRoleNodeConstraint(constraint);
}

async function deleteRoleNodeConstraint_(constraint: RoleNodeConstraint) {
  constraint.role_id = role_id.value;
  await roleStore.deleteRoleNodeConstraint(constraint);
}

async function editRoleNodeConstraint(constraints: RoleNodeConstraint[]) {
  newRoleNodeConstraintCard = constraints[0];
  newRoleNodeConstraint.value = true;
}

onBeforeMount(async () => {
  if (route.params.role_id) {
    role_id.value = Number(route.params.role_id);
    await roleStore.ensureRole({ role_id: role_id.value });
  }
  await roleStore.ensureAllRoles();
  ready.value = true;
});
</script>

<style scoped>
.role-page {
  background: var(--sc-color-bg-muted);
  min-height: 100vh;
}
</style>
