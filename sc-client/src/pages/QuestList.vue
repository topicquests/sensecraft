<template>
  <q-page class="quest-page" v-if="ready">
    <div class="row justify-center">
      <q-card class="q-mt-sm quest-card">
        <div class="dashboard-badge">
          <q-btn flat color="primary" @click="router.push({ name: 'lobby' })">
            <q-badge color="secondary" text-color="white" class="q-pa-sm">
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
    Promise.resolve(questStore.ensureAllQuests()),
    Promise.resolve(guildStore.setCurrentGuild(false)),
    Promise.resolve(questStore.setCurrentQuest(true)),
  ]);
  ready.value = true;
});
</script>

<style scoped>
.quest-page {
  background: var(--sc-color-bg-muted);
  min-height: 100vh;
  box-sizing: border-box;
}

.dashboard-badge {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin-bottom: var(--sc-space-16);
}

.quest-card {
  width: 75%;
  padding: var(--sc-space-24);
}

@media only screen and (max-width: 1300px) {
  .quest-card {
    width: 90%;
  }
}
@media only screen and (max-width: 800px) {
  .quest-card {
    width: 98%;
    padding: var(--sc-space-16);
  }
}
</style>
