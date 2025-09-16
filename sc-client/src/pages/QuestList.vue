<template>
  <q-page class="bg-secondary quest-page" v-if="ready">
    <div class="row justify-center">
      <q-card class="q-mt-sm quest-card">
        <div class="dashboard-badge">
          <q-btn
            flat
            color="primary"
            @click="router.push({ name: 'lobby' })"
          >
            <q-badge color="secondary" text-color="black" class="q-pa-sm">
              Dashboard
            </q-badge>
          </q-btn>
          <member-handle />
        </div>
        <div class="column items-center">
          <div class="col-12 q-mb-md">
            <scoreboard></scoreboard>
          </div>
        </div>
        <div class="column items-center">
          <div class="col-4 q-pl-md q-pb-sm" style="width: 100%">
            <q-btn
              color="primary"
              v-if="
                checkForPermission(permission_enum.createQuest) ||
                checkForPermission(permission_enum.superadmin)
              "
              label="New Quest"
              @click="
                router.push({
                  name: 'create_quest',
                })
              "
            />
          </div>
        </div>
        <div class="column items-center">
          <div class="col-4" style="width: 100%">
            <div
              v-if="questStore.getQuests && questStore.getQuests.length"
              class="col-4 q-pa-sm"
              style="width: 100%"
            >
              <quest-table :quests="questStore.getQuests" :title="'Quests'" />
            </div>
            <div v-else class="column items-center q-mt-md">
              <h4>There are no quests</h4>
            </div>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import scoreboard from '../components/score-board.vue';
import questTable from '../components/quest-table.vue';

import { waitUserLoaded } from '../app-access';
import { useBaseStore } from '../stores/baseStore';
import { useQuestStore } from '../stores/quests';
import { useGuildStore } from '../stores/guilds';
import { permission_enum } from '../enums';
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import memberHandle from '../components/member-handle.vue';

// Stores
const questStore = useQuestStore();
const guildStore = useGuildStore();
const baseStore = useBaseStore();
const router = useRouter();

// Reactive Variables
const ready = ref(false);

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

// Lifecycle Hooks
onBeforeMount(async () => {
  await waitUserLoaded();
  await Promise.all([
    questStore.ensureAllQuests(),
    guildStore.setCurrentGuild(false),
    questStore.setCurrentQuest(true),
  ]);
  ready.value = true;
});
</script>

<style>
.dashboard-badge {
  display: flex;
  justify-content: space-between; 
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 1rem;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  background: transparent;
  color: black;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.3s, transform 0.2s;
}

.dashboard-badge:hover {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  transform: translateY(-1px);  
}

.dashboard-badge:active {
  transform: scale(0.97);       
}
.quest-page {
  background: url('../statics/images/questBackgroundImage.jpg') no-repeat center
    center fixed !important;
  background-size: cover;
  min-height: 100vh;
  padding: 0rem;
  box-sizing: border-box;
}

.quest-card {
  width: 75%;
  background-color: transparent;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
}

/* Adjustments for smaller screens */
@media only screen and (max-width: 1300px) {
  .quest-card {
    width: 80%;
  }
}
@media only screen and (max-width: 800px) {
  .quest-card {
    width: 98%;
  }
}

/* Buttons */
.q-btn {
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}
.q-btn:hover {
  background-color: #0056b3;
}

/* Table Styles */
.quest-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  font-size: 1.05rem;
  margin-bottom: 1.5rem;
  transition: box-shadow 0.2s;
}
.quest-table th,
.quest-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
}
.quest-table th {
  background: linear-gradient(90deg, #004080 80%, #0056b3 100%);
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #003366;
}
.quest-table tr:last-child td {
  border-bottom: none;
}
.quest-table tr:nth-child(even) {
  background-color: #f8fafc;
}
.quest-table tr:hover {
  background-color: #e6f0ff;
  transition: background 0.2s;
}
.quest-table th,
.quest-table td {
  padding: 0.75rem;
  border: 1px solid #ddd;
}
.quest-table th {
  background-color: #004080;
  color: white;
}
.quest-table tr:nth-child(even) {
  background-color: #f2f2f2;
}
.quest-table tr:hover {
  background-color: #e0e0e0;
}

.quest-page {
  background: url('../statics/images/questBackgroundImage.jpg') no-repeat center
    center fixed !important;
  background-size: cover;
  min-height: 100vh;
  padding: 0rem;
  box-sizing: border-box;
}

.quest-card {
  width: 75%;
  background-color: transparent;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
}

/* Adjustments for smaller screens */
@media only screen and (max-width: 1300px) {
  .quest-card {
    width: 80%;
  }
}
@media only screen and (max-width: 800px) {
  .quest-card {
    width: 98%;
  }
}

/* Buttons */
.q-btn {
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}
.q-btn:hover {
  background-color: #0056b3;
}

/* Table Styles */
.quest-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  font-size: 1.05rem;
  margin-bottom: 1.5rem;
  transition: box-shadow 0.2s;
}
.quest-table th,
.quest-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
}
.quest-table th {
  background: linear-gradient(90deg, #004080 80%, #0056b3 100%);
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #003366;
}
.quest-table tr:last-child td {
  border-bottom: none;
}
.quest-table tr:nth-child(even) {
  background-color: #f8fafc;
}
.quest-table tr:hover {
  background-color: #e6f0ff;
  transition: background 0.2s;
}
.quest-table th,
.quest-table td {
  padding: 0.75rem;
  border: 1px solid #ddd;
}
.quest-table th {
  background-color: #004080;
  color: white;
}
.quest-table tr:nth-child(even) {
  background-color: #f2f2f2;
}
.quest-table tr:hover {
  background-color: #e0e0e0;
}
</style>
