<template>
  <q-card class="flat bordered q-pa-md bg-black">
    <div class="row">
      <div class="col-12 col-md">
        <p class="text">Gameboard</p>
      </div>
    </div>
    <div class="row justify-center q-gutter-md">
      <q-card class="score-card">
        <span class="scoreboard-header">Quests</span>
        <div class="row">
          <div class="col-4" style="width: 50%">
            <div class="labels">Not started:</div>
            <div class="labels">Playing</div>
            <div class="labels">Finished</div>
          </div>
          <div class="col-4">
            <div>
              <span class="labels">{{ questCount(status.registration) }} </span>
            </div>
            <div>
              <span class="labels">{{ questCount(status.ongoing) }} </span>
            </div>
            <div>
              <span class="labels">{{ questCount(status.finished) }} </span>
            </div>
          </div>
        </div>
      </q-card>
      <q-card class="score-card">
        <span class="scoreboard-header">Guilds</span>
        <div class="row">
          <div class="col-4" style="width: 70%">
            <div class="labels">Number of Guilds:</div>
            <div class="labels">Most Quests:</div>
            <div class="labels">Highest Score:</div>
          </div>
          <div class="col-3">
            <div>
              <span class="labels">{{ guildStore.getGuilds.length }}</span>
            </div>
            <div>
              <span class="labels">0</span>
            </div>
            <span class="labels">0</span>
          </div>
        </div>
      </q-card>
      <q-card class="score-card">
        <span class="scoreboard-header">Players</span>
        <div class="row">
          <div class="col-4" style="width: 70%">
            <div class="labels">Number of players:</div>
            <div class="labels">Most Quests:</div>
            <div class="labels">Highest Score:</div>
          </div>
          <div class="col-3">
            <div>
              <span class="labels">{{ membersStore.getMembers.length }}</span>
            </div>
            <div>
              <span class="labels">0</span>
            </div>
            <div>
              <span class="labels">0</span>
            </div>
          </div>
        </div>
      </q-card>
    </div>
  </q-card>
</template>
<script setup lang="ts">

import  { ref } from "vue";
import { useMembersStore } from "../stores/members"
import { useGuildStore } from "src/stores/guilds";
import { useQuestStore } from "src/stores/quests";
import { quest_status_enum } from "../enums";
import { onBeforeMount } from "vue";

const status = ref(quest_status_enum);
const questStore = useQuestStore();
const guildStore = useGuildStore();
const membersStore = useMembersStore();

function questCount(st: quest_status_enum) {
  if (questStore.getQuestsByStatus(st)) {
    return questStore.getQuestsByStatus(st).length;
  }
  return 0;
  }

  onBeforeMount(async () => {
    await Promise.all([
      questStore.ensureAllQuests(),
      guildStore.ensureAllGuilds(),
      membersStore.ensureAllMembers(),
    ]);
  })

</script>
<style>
.b1 {
  border-right-style: solid;
  border-right-color: yellow;
}
.labels {
  color: yellow;
  font-size: 110%;
  text-align: left;
  font-family: Arial, Helvetica, sans-serif;
  width: 25em;
}
.scoreboard-header {
  color: yellow;
  font-size: 110%;
  text-align: left;
  font-weight: bold;
  font-family: Arial, Helvetica, sans-serif;
}

.score-card {
  background-color: black;
  width: 100%;
  max-width: 200px;
}

p.text {
  text-align: center;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 30px;
  color: yellow;
  background-color: black;
}
#scoreboard {
  width: 900px;
  border: 1px solid blue;
}

@media only screen and (max-width: 600px) {
  p.text {
    font-size: 20px;
  }
}
</style>
