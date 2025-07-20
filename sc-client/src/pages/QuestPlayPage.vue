<template>
  <q-page v-if="ready" class="bg-secondary quest-play-page">
    <div class="row justify-center">
      <q-card style="width: 80%; background-color: transparent" class="q-mt-md">
        <div>
          <member></member>
        </div>
        <quest-details></quest-details>
        <quest-actions :myPlayingGuilds="myPlayingGuilds" :questId="questId">
        </quest-actions>
        <div class="row justify-center q-mt-lg">
          <router-link
            :to="{
              name: 'conversation_column',
              params: { quest_id: questId },
            }"
          >
            Card View
          </router-link>
        </div>
        <div class="row justify-center">
          <q-card class="q-pa-md" style="width: 90%">
            <quest-node-tree
              :questId="questId"
              :guildId="guildId"
              :selectedNodeId="selectedNodeId"
            >
            </quest-node-tree>
          </q-card>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import member from '../components/member-handle.vue';
import questNodeTree from '../components/quest-node-tree.vue';
import questDetails from '../components/quest-details.vue';
import questActions from '../components/quest-actions.vue';
import { waitUserLoaded } from '../app-access';
import { useRoute } from 'vue-router';
import { ref, computed, onMounted, watch } from 'vue';
import { useQuestStore } from '../stores/quests';
import { useGuildStore } from '../stores/guilds';
import { useMemberStore } from '../stores/member';
import { GuildData, GuildMembership } from '../types';

// Stores
const questStore = useQuestStore();
const guildStore = useGuildStore();
const memberStore = useMemberStore();

// Route
const route = useRoute();

// Reactive Variables
const ready = ref(false);
const questId = ref<number | undefined>(undefined);
const mySelectedPlayingGuildId = ref<number | undefined>(undefined);
const selectedNodeId = ref<number | undefined>(undefined);

// Variables
let myPlayingGuilds: GuildData[] = [];

// Lifecycle Hooks
onMounted(async () => {
  ready.value = false;
  await initialize();
  ready.value = true;
});

// Computed Properties
const guildId = computed(() => {
  const quest_id = questStore.getCurrentQuest?.id;
  const casting = memberStore.castingPerQuest[quest_id!];
  return casting ? casting.guild_id : undefined;
});
// Watches
watch(guildId, async () => {
  await initializeGuildInner();
});
watch(questId, async () => {
  await initialize();
});

// Functions
function guildsPlayingGame(onlyMine = false, recruiting = false) {
  let guildIds =
    questStore.getCurrentQuest?.game_play?.map((gp) => gp.guild_id) || [];
  if (onlyMine) {
    guildIds = guildIds.filter((g) =>
      memberStore.member?.guild_membership?.some(
        (gm: GuildMembership) => gm.guild_id === g && gm.status === 'confirmed',
      ),
    );
  }
  let guilds = guildIds.map((gid) => guildStore.getGuildById(gid));
  if (recruiting) {
    guilds = guilds.filter((g) => g.open_for_applications);
  }
  return guilds;
}

async function initialize() {
  await waitUserLoaded();
  if (typeof route.params.quest_id === 'string') {
    questId.value = Number.parseInt(route.params.quest_id);
  }
  questStore.setCurrentQuest(questId.value!);
  await Promise.all([
    questStore.ensureQuest({ quest_id: questId.value! }),
    guildStore.ensureGuildsPlayingQuest({ quest_id: questId.value! }),
  ]);
  await initializeGuildInner();
}

async function initializeGuildInner() {
  if (guildId.value) {
    ready.value = false;
    guildStore.setCurrentGuild(guildId.value);
    await guildStore.ensureGuild(guildId.value);
    if (!selectedNodeId.value) {
      selectedNodeId.value = questStore.getCurrentGamePlay?.focus_node_id;
    }
    ready.value = true;
  } else if (memberStore.member) {
    myPlayingGuilds = guildsPlayingGame(true);
    if (myPlayingGuilds.length) {
      mySelectedPlayingGuildId.value = myPlayingGuilds[0].id;
    }
  }
}
</script>

<style scoped>
.quest-play-page {
  background: url('../statics/images/questBackgroundImage.jpg') no-repeat center
    center fixed !important;
  background-size: cover;
  min-height: 100vh;
  padding: 0rem;
  box-sizing: border-box;
}
.sidenav {
  height: 100%;
  width: 15%;
  position: fixed;
  z-index: 1;
  top: 0;
  right: 0;
  color: black;
  background-color: rgb(230, 234, 238);
  overflow-x: hidden;
  transition: 0.5s;
  padding-top: 60px;
  border: 1px solid gray;
}
.quest-name {
  text-decoration: underline;
  padding: 5px;
  margin-top: 16px;
}
</style>
