<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card class="lobby-card q-mt-md q-pa-md">
        <div>
          <member></member>
        </div>
        <div class="column items-center">
          <div class="col-12 q-mb-md scoreboard">
            <scoreboard></scoreboard>
          </div>
        </div>
        <div class="column items-center">
          <div v-if="questsStore.getActiveQuests.length" style="width: 100%">
            <quest-table
              :quests="questsStore.getActiveQuests"
              :title="'Active Quests'"
            />
            <q-btn :to="{ name: 'quest_list' }">All Quests</q-btn>
          </div>
          <div v-else-if="questsStore.getQuests.length" class="col-6" style="width: 100%">
            <quest-table 
                :quests="questsStore.getQuests" 
                :title="'Quests'" />
          </div>
          <div v-else class="column items-center q-mt-md">
            <h4>There are no quests</h4>
          </div>
        </div>
        <div class="column items-center">
          <div class="col-4" style="width: 100%">
            <div v-if="guildsStore.getMyGuilds.length">
              <guilds-table
                :guilds="guildsStore.getMyGuilds"
                :title="'My Guilds'"
              />
              <q-btn :to="{ name: 'guild_list' }">All Guilds</q-btn>
            </div>
            <div v-else-if="getOpenGuilds.length">
              <guilds-table
                :guilds="getOpenGuilds"
                v-bind:title="'Open Guilds'"
              />
              <p v-if="memberStore.getUserId">Consider joining one of these guilds!</p>
              <p v-else>Register and join one of these guilds!</p>
              <q-btn
                v-if="getOpenGuilds.length < guildsStore.getGuilds.length"
                :to="{ name: 'guild_list' }"
                >All Guilds</q-btn
              >
            </div>
            <div v-else-if="guildsStore.getGuilds.length">
              <guilds-table v-bind:guilds="guildsStore.getGuilds" v-bind:title="'Guilds'" />
              <p>No guild is recruiting right now</p>
            </div>
            <h4 v-else style="text-align: center">
              There are currently no guilds
            </h4>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import scoreboard from '../components/score-board.vue';
import QuestTable from '../components/quest-table.vue';
import GuildsTable from '../components/guilds-table.vue';
import { useMemberStore } from '../stores/member';
import { useGuildStore } from '../stores/guilds';
import { useQuestStore } from '../stores/quests';
import { Guild, GuildData } from '../types';
//import { userLoaded } from '../boot/userLoaded';
import { onBeforeMount } from 'vue';
import  member  from '../components/member.vue'

const memberStore = useMemberStore();
const guildsStore = useGuildStore();
const questsStore = useQuestStore();
let ready = false;
    
function getOpenGuilds(): GuildData[]  {      
  return guildsStore.getGuilds.filter((guild: Guild) =>
  guild.open_for_applications && !guildsStore.isGuildMember(guild.id));
};

onBeforeMount(async () => {
  //await userLoaded;
    // all guilds and quests
  //await guildsStore.setCurrentGuild(true);
  //await questsStore.setCurrentQuest(true);
  await Promise.all([questsStore.ensureAllQuests(), guildsStore.ensureAllGuilds()]);
  ready = true;
});
</script>

<style>
p {
  background-color: lightgrey;
  font-size: 15pt;
}

.lobby-card {
  width: 60%;
}

.scoreboard {
  width: 75%;
}

@media only screen and (max-width: 1300px) {
  .lobby-card {
    width: 80%;
  }
}

@media only screen and (max-width: 800px) {
  .lobby-card {
    width: 98%;
  }
}

@media only screen and (max-width: 1000px) {
  .scoreboard {
    width: 98%;
  }
}
</style>
