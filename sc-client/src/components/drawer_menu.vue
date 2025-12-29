<template>
  <div>
    <q-list>
      <q-item :to="{ name: 'root' }">
        <q-item-section>Home</q-item-section>
      </q-item>
      <q-item :to="{ name: 'house_rules' }">
        <q-item-section>House Rules</q-item-section>
      </q-item>
      <q-item v-if="checkIfAuthenticated()" :to="{ name: 'lobby' }">
        <q-item-section>Dashboard</q-item-section>
      </q-item>
      <q-item :to="{ name: 'quest_list' }">
        <q-item-section>Quest</q-item-section>
      </q-item>
      <q-item
        data-test="create-quest-link"
        v-if="checkForPermission(permission_enum.createQuest)"
        :to="{ name: 'create_quest' }"
      >
        <q-item-section>Create Quest</q-item-section>
      </q-item>
      <q-item :to="{ name: 'guild_list' }">
        <q-item-section>Guilds</q-item-section>
      </q-item>
      <q-item
        data-test="create-guild-link"
        v-if="checkForPermission(permission_enum.createGuild)"
        :to="{ name: 'create_guild' }"
      >
        <q-item-section>Create Guild</q-item-section>
      </q-item>
      <q-item
        v-if="checkForPermission(permission_enum.superadmin)"
        :to="{ name: 'admin' }"
      >
        <q-item-section>Administration</q-item-section>
      </q-item>
      <q-item
        v-if="!checkIfAuthenticated()"
        class="q-mr-sm lt-md"
        :to="{ name: 'signin' }"
      >
        <q-item-section>Signin</q-item-section>
      </q-item>
      <q-item
        v-if="!checkIfAuthenticated()"
        class="q-mr-sm lt-md"
        :to="{ name: 'register' }"
      >
        <q-item-section>Registration</q-item-section>
      </q-item>
      <q-item-section></q-item-section>
      <q-item
        v-if="checkIfAuthenticated()"
        class="lt-md"
        clickable
        @click="onLogout"
      >
        <q-item-section>logoff</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
// Imports
import { ref } from 'vue';
import { permission_enum } from '../enums';
import { useBaseStore } from '../stores/baseStore';
import { useMemberStore } from '../stores/member';

// Emits
const emit = defineEmits(['onLogout']);

// Stores
const baseStore = useBaseStore();
const memberStore = useMemberStore();

// Reactive Variables
const isAuthenticated = ref(false);

// Non Reactive Vasriables
let hasPermission: boolean = false;

// Functions
function checkForPermission(permission_enum: permission_enum): boolean {
  hasPermission = baseStore.hasPermission(permission_enum);
  if (hasPermission == true) {
    return true;
  }
  return false;
}
function checkIfAuthenticated(): boolean {
  isAuthenticated.value = memberStore.isAuthenticated;
  if (isAuthenticated.value == true) {
    return true;
  }
  return false;
}
const onLogout = () => {
  emit('onLogout');
};
</script>
