<template>
  <q-page class="bg-secondary" v-if="ready">
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
            <div v-if="guildStore.getGuilds.length">
              <guilds-table :guilds="guildStore.getGuilds" 
                            :title="'Guilds'">
              </guilds-table>
            </div>
            <h3 v-else>There currently are no guilds</h3>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import scoreboard from "../components/score-board.vue";
import member from "../components/member-handle.vue";
import { userLoaded } from "../boot/userLoaded";
import GuildsTable from "../components/guilds-table.vue";
import { useGuildStore } from '../stores/guilds'
import { Guild } from "../types";
import { onBeforeMount, ref } from "vue";

const ready = ref(false);
const guildStore = useGuildStore();

onBeforeMount(async() => {
  await userLoaded;
  await Promise.all([
      guildStore.ensureAllGuilds(),
      await this.ensureAllRoles(),
      guildStore.setCurrentGuild(true),
      this.setCurrentQuest(false),
    ]);
    ready.value = true;
})
</script>
<style>
.guildlist-card {
  width: 60%;
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
