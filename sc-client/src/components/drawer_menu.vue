<template>
    <div>
            <q-list>
                <q-item :to="{name: 'root'}">
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
                    v-if="checkForPermission(permission_enum.createQuest)" 
                    :to="{ name: 'create_quest' }" 
                >
                    <q-item-section>Create Quest</q-item-section>
                </q-item>
                <q-item :to="{ name: 'guild_list' }">
                    <q-item-section>Guilds</q-item-section>
                </q-item>
                <q-item 
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
                    :to="{ name: 'signin'}">
                    <q-item-section>Signin</q-item-section>
                </q-item>
                <q-item 
                    v-if="!checkIfAuthenticated()"
                    class="q-mr-sm lt-md"
                    :to="{name: 'register'}">
                    <q-item-section>Registration</q-item-section>
                </q-item>
                <q-item-section></q-item-section>
                <q-item 
                    v-if="checkIfAuthenticated()"
                    class="lt-md"
                >
                    <q-item-section>Logoff</q-item-section>
                </q-item>
            </q-list>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { permission_enum } from '../enums';
import { useBaseStore } from 'src/stores/baseStore';
import { useMemberStore } from 'src/stores/member';

const baseStore=useBaseStore();
const memberStore=useMemberStore();
const isAuthenticated = ref(false);
let hasPermission:boolean=false;
const emit = defineEmits(['onLogout'])
function checkForPermission(permission_enum: permission_enum): boolean {
  hasPermission = baseStore.hasPermission(permission_enum);
  if (hasPermission == true) {
    return true;
  }
  return false;
};
function checkIfAuthenticated(): boolean {
  isAuthenticated.value = memberStore.isAuthenticated;
  if (isAuthenticated.value == true) {
    return true;
  }
  return false;
};
const onLogout = () => {
  emit('onLogout');
};
</script>