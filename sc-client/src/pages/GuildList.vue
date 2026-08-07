<template>
  <q-page class="guildlist-page" v-if="ready">
    <div class="row justify-center">
      <q-card class="guildlist-card q-mt-md q-pa-md">
        <div>
          <member></member>
        </div>
        <div class="column items-center">
          <div class="col-12 q-mb-md scoreboard">
            <scoreboard></scoreboard>
          </div>
        </div>
        <div class="column items-center">
          <div class="col-6" style="width: 100%">
            <div v-if="guilds.length">
              <guilds-table :guilds="guilds" :title="'Guilds'"> </guilds-table>
            </div>
            <empty-state
              v-else
              icon="groups"
              title="There currently are no guilds"
            />
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import scoreboard from '../components/score-board.vue';
import member from '../components/member-handle.vue';
import { waitUserLoaded } from '../app-access';
import GuildsTable from '../components/guilds-table.vue';
import EmptyState from '../components/EmptyState.vue';
import { useGuildStore } from '../stores/guilds';
import { computed, onBeforeMount, ref } from 'vue';
import { useRoleStore } from '../stores/role';
import { useQuestStore } from '../stores/quests';

// Stores
const guildStore = useGuildStore();
const roleStore = useRoleStore();
const questStore = useQuestStore();

// Reactive Variables
const ready = ref(false);

// Computed Properties
const guilds = computed(() => guildStore.getGuilds);

// Lifecycle Hooks
onBeforeMount(async () => {
  await waitUserLoaded();
  await Promise.all([
    guildStore.ensureAllGuilds(),
    await roleStore.ensureAllRoles(),
    guildStore.setCurrentGuild(true),
    questStore.setCurrentQuest(false),
  ]);
  ready.value = true;
});
</script>
<style scoped>
.guildlist-page {
  background: var(--sc-color-bg-muted);
  min-height: 100vh;
  padding: 0;
  box-sizing: border-box;
}
.guildlist-card {
  width: 60%;
  background-color: var(--sc-color-surface);
}

.scoreboard {
  width: 75%;
}

@media only screen and (max-width: 800px) {
  .guildlist-card {
    width: 95%;
  }
}
@media only screen and (max-width: 1000px) {
  .scoreboard {
    width: 98%;
  }
}
</style>
