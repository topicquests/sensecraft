<template>
  <q-page class="bg-secondary page" v-if="ready">
    <div class="row justify-center q-mt-lg">
      <h3>
        Channels of guild
        <router-link
          :to="{
            name: 'guild',
            params: {
              guild_id: guildId,
            },
          }"
          >{{ currentGuild!.name }}</router-link
        >
        in quest
        <router-link
          :to="{
            name: 'quest_page',
            params: {
              quest_id: questId,
            },
          }"
          >{{ currentQuest!.name }}</router-link
        >
      </h3>
    </div>
    <div class="column items-center q-mb-md">
      <div class="col-6">
        <channel-list
          :guild_id="guildId"
          :quest_id="questId"
          :inPage="true"
          title="Game Channels"
        />
      </div>
    </div>
    <div class="column items-center q-mb-md">
      <div class="col-6">
        <q-btn
          v-if="canAddGameChannel && !creatingGameC"
          @click="createGameChannel()"
          label="Create Game Channel"
        />
        <!-- todo: create_guild_channel permission -->
        <q-input
          v-if="creatingGameC"
          v-model="newGameChannelName"
          label="Game channel name"
          id="channel_name"
        />
        <q-btn
          v-if="creatingGameC"
          @click="cancelCreateGameChannel()"
          label="Cancel"
        />
        <q-btn
          v-if="creatingGameC"
          @click="confirmCreateGameChannel()"
          label="Confirm"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import ChannelList from '../components/ChannelListComponent.vue';
import { waitUserLoaded } from '../app-access';
import {
  ibis_node_type_enum,
  meta_state_enum,
  permission_enum,
  publication_state_enum,
} from '../enums';
import { ConversationNode } from '../types';
import { computed, onBeforeMount, ref } from 'vue';
import { useQuestStore } from '../stores/quests';
import { useBaseStore } from '../stores/baseStore';
import { useChannelStore } from '../stores/channel';
import { useRoute } from 'vue-router';
import { useGuildStore } from '../stores/guilds';

const route = useRoute();
const questStore = useQuestStore();
const guildStore = useGuildStore();
const baseStore = useBaseStore();
const channelStore = useChannelStore();
const guildId = ref<number>();
const questId = ref<number>();
const creatingGameC = ref(false);
const newGameChannelName = ref('');
const ready = ref(false);
const currentGuild = computed(() => guildStore.getCurrentGuild);
const currentQuest = computed(() => questStore.getCurrentQuest);

const canAddGameChannel = computed({
  get: () => {
    return (
      questStore.isPlayingQuestInGuild(questId.value, guildId.value) &&
      baseStore.hasPermission(
        permission_enum.publishGameMove,
        guildId.value,
        questId.value,
      )
    );
  },
  set: () => {},
});
function createGameChannel() {
  creatingGameC.value = true;
}
function cancelCreateGameChannel() {
  creatingGameC.value = false;
}
async function confirmCreateGameChannel() {
  const channel: Partial<ConversationNode> = {
    title: newGameChannelName.value,
    node_type: ibis_node_type_enum.channel,
    meta: meta_state_enum.channel,
    status: publication_state_enum.guild_draft,
    guild_id: guildId.value,
    quest_id: questId.value,
  };
  await channelStore.createChannelNode(channel);
  creatingGameC.value = false;
}
onBeforeMount(async () => {
  waitUserLoaded;
  if (typeof route.params.guild_id === 'string')
    guildId.value = Number.parseInt(route.params.guild_id);
  if (typeof route.params.quest_id === 'string')
    questId.value = Number.parseInt(route.params.quest_id);
  guildStore.setCurrentGuild(guildId.value!);
  questStore.setCurrentQuest(questId.value!);
  await Promise.all([
    guildStore.ensureGuild(guildId.value!),
    questStore.ensureQuest({ quest_id: questId.value! }),
    channelStore.ensureChannels(guildId.value!),
  ]);
  ready.value = true;
});
</script>

<style scoped>
.page {
  background-color: whitesmoke;
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
</style>
