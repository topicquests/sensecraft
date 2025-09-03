<template>
  <q-card class="gameboard-card q-pa-lg">
    <!-- Header -->
    <div class="row justify-center q-mb-md">
      <p class="title">🎮 Gameboard</p>
    </div>

    <!-- Scoreboard in single row -->
    <div class="row no-wrap justify-around items-stretch">
      <!-- Quests -->
      <q-card class="score-card q-pa-md">
        <div class="scoreboard-header">Quests</div>
        <div class="row items-center q-mt-sm">
          <div class="col text-labels">
            <div>Not started</div>
            <div>Playing</div>
            <div>Finished</div>
          </div>
          <div class="col-auto text-values">
            <div>{{ questCount(status.registration) }}</div>
            <div>{{ questCount(status.ongoing) }}</div>
            <div>{{ questCount(status.finished) }}</div>
          </div>
        </div>
      </q-card>

      <!-- Guilds -->
      <q-card class="score-card q-pa-md">
        <div class="scoreboard-header">Guilds</div>
        <div class="row items-center q-mt-sm">
          <div class="col text-labels">
            <div>Total Guilds</div>
            <div>Most Quests</div>
            <div>Highest Score</div>
          </div>
          <div class="col-auto text-values">
            <div>{{ guildStore.getGuilds.length }}</div>
            <div>0</div>
            <div>0</div>
          </div>
        </div>
      </q-card>

      <!-- Players -->
      <q-card class="score-card q-pa-md">
        <div class="scoreboard-header">Players</div>
        <div class="row items-center q-mt-sm">
          <div class="col text-labels">
            <div>Total Players</div>
            <div>Most Quests</div>
            <div>Highest Score</div>
          </div>
          <div class="col-auto text-values">
            <div>{{ membersStore.getMembers.length }}</div>
            <div>0</div>
            <div>0</div>
          </div>
        </div>
      </q-card>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { useMembersStore } from '../stores/members'
import { useGuildStore } from '../stores/guilds'
import { useQuestStore } from '../stores/quests'
import { quest_status_enum } from '../enums'

const status = ref(quest_status_enum)
const questStore = useQuestStore()
const guildStore = useGuildStore()
const membersStore = useMembersStore()

function questCount(st: quest_status_enum) {
  return questStore.getQuestsByStatus(st)?.length || 0
}

onBeforeMount(async () => {
  await Promise.all([
    questStore.ensureAllQuests(),
    guildStore.ensureAllGuilds(),
    membersStore.ensureAllMembers()
  ])
})
</script>

<style scoped>
.gameboard-card {
  background-color: #000;
  border-radius: 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
  max-width: 1200px;
  margin: auto;
}

.title {
  text-align: center;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 32px;
  font-weight: bold;
  color: #ffd700;
}

.score-card {
  background: #111;
  border-radius: 16px;
  min-width: 250px;   /* wider base */
  max-width: 300px;   /* allow more width */
  flex: 0 0 auto;     /* don’t auto-stretch */
  margin: 0 16px;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}


.scoreboard-header {
  color: #ffd700;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  font-family: Arial, Helvetica, sans-serif;
}

.text-labels {
  color: #ccc;
  font-size: 14px;
  line-height: 1.8;
}

.text-values {
  color: #ffd700;
  font-size: 16px;
  font-weight: bold;
  text-align: right;
  line-height: 1.8;
}

@media (max-width: 800px) {
  .row.no-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .score-card {
    min-width: 220px;
  }
}
</style>
