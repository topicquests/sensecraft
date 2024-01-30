<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card class="q-mt-md quest-card">
        <div>
          <member></member>
        </div>
        <div class="column items-center">
          <div class="col-12 q-mb-md">
            <scoreboard></scoreboard>
          </div>
        </div>
        <div class="column items-center">
          <div class="col-4 q-pl-md q-pb-md" style="width: 100%">
            <q-btn
              color="primary"
              v-if="memberStore.member"
              label="New Quest"
              @click="
                $router.push({
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
              class="col-4 q-pa-lg"
              style="width: 100%"
            >
              <quest-table v-bind:quests="questStore.getQuests" title="Quests" />
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
import scoreboard from '../components/scoreboard.vue';
import questTable from '../components/quest-table.vue';
import member from '../components/member.vue';

import { userLoaded } from '../boot/userLoaded';
import { useMemberStore } from 'src/stores/member';
import { useQuestStore } from 'src/stores/quests';
import { useGuildStore } from 'src/stores/guilds'
import { onBeforeMount } from 'vue';

const memberStore = useMemberStore();
const questStore = useQuestStore();
const guildStore = useGuildStore();

let ready = false;

  isAuthenticated: false;
  serverData: [];

   onBeforeMount(async () => {
    await userLoaded;
    // not using those yet?
    await Promise.all([
      questStore.ensureAllQuests(),
      // guildStore.setCurrentGuild(false),
      // questStore.setCurrentQuest(true),
    ]);
    ready = true;

</script>

<style>
.quest-card {
  width: 75%;
}
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
</style>
