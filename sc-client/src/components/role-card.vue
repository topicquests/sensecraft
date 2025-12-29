<template>
  <div class="col-4">
    <q-card class="q-pa-lg" style="width: 100%">
      <q-input
        style="width: 40%"
        v-model="currentRole.name"
        label="Name"
        type="text"
      ></q-input>
      <q-select
        style="width: 80%"
        class="q-pt-md"
        v-model="currentRole.permissions"
        :multiple="true"
        label="Permission"
        :options="permission_list"
      ></q-select>
      <q-select
        style="width: 70%"
        clearable
        filled
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
        <q-btn
          v-if="edit"
          label="Delete"
          @click="deleteRoleById()"
          color="primary"
          class="q-mr-md q-ml-md"
        />
        <q-btn label="Cancel" @click="router.push({ name: 'home' })" />
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { Role } from '../types';
import { publication_state_enum, permission_enum } from '../enums';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

//Emits
const emit = defineEmits<{
  createNewRole: [role: Partial<Role>];
  updateCurrentRole: [role: Partial<Role>];
  deleteRoleById: [role: Partial<Role>];
}>();

const RoleCardProps = defineProps<{
  role: Role;
  edit: boolean;
  guild_id?: number;
}>();

const currentRole = ref<Partial<Role>>(RoleCardProps.role);
const permission_list = Object.keys(permission_enum);
const publication_state = Object.keys(publication_state_enum);

watch(
  () => RoleCardProps.role,
  (newRole) => {
    currentRole.value = { ...newRole };
  },
  { immediate: true }, // Trigger immediately on component initialization
);

function createNewRole() {
  emit('createNewRole', currentRole.value);
}
function updateCurrentRole() {
  emit('updateCurrentRole', currentRole.value);
}
function deleteRoleById() {
  emit('deleteRoleById', currentRole.value);
}
</script>
