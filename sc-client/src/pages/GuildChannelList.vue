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
        >
          {{ currentGuild.name }}
        </router-link>
      </h3>
    </div>

    <div class="col-3 q-md q-mb-md">
      <channel-list :guild_id="guildId" :inPage="true" title="Guild Channels" />
      <q-btn
        v-if="canAddChannel() && !creating"
        data-test="create-guild-channel-Btn"
        @click="createGuildChannel"
        label="Create Guild Channel"
      />
      <node-form
        v-if="creating"
        :nodeInput="newChannelNode"
        :editing="true"
        :ibisTypes="[ibis_node_type_enum.channel]"
        :roles="[]"
        :allowChangeMeta="false"
        :pubFn="() => [publication_state_enum.guild_draft]"
        @action="handleNewChannelSubmit"
        @cancel="cancelCreateGuildChannel"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import ChannelList from '../components/ChannelListComponent.vue';
import NodeForm from '../components/node-form.vue';
import { waitUserLoaded } from '../app-access';
import {
  ibis_node_type_enum,
  meta_state_enum,
  permission_enum,
  publication_state_enum,
} from '../enums';
import { ConversationNode } from '../types';
import { computed, onBeforeMount, ref } from 'vue';
import { useGuildStore } from '../stores/guilds';
import { useBaseStore } from '../stores/baseStore';
import { useChannelStore } from '../stores/channel';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';

const route = useRoute();
const q = useQuasar();
const guildStore = useGuildStore();
const baseStore = useBaseStore();
const channelStore = useChannelStore();
const currentGuild = computed(() => guildStore.getCurrentGuild!);
const guildId = ref<number>();
const ready = ref(false);
const creating = ref(false);
const newChannelNode = ref<Partial<ConversationNode>>({});

function canAddChannel() {
  return baseStore.hasPermission(permission_enum.guildAdmin, guildId.value);
}

function createGuildChannel() {
  newChannelNode.value = {
    title: '',
    node_type: ibis_node_type_enum.channel,
    meta: meta_state_enum.channel,
    status: publication_state_enum.guild_draft,
    guild_id: guildId.value,
  };
  creating.value = true;
}

function cancelCreateGuildChannel() {
  creating.value = false;
}

async function handleNewChannelSubmit(node: Partial<ConversationNode>) {
  try {
    await channelStore.createChannelNode(node);
    q.notify({
      message: 'Channel created successfully',
      color: 'positive',
    });
  } catch (err) {
    console.error('Error creating channel:', err);
    q.notify({
      message: 'Failed to create channel',
      color: 'negative',
    });
  }
  creating.value = false;
}

onBeforeMount(async () => {
  await waitUserLoaded();
  if (typeof route.params.guild_id === 'string') {
    guildId.value = Number.parseInt(route.params.guild_id);
  }
  guildStore.setCurrentGuild(guildId.value!);
  await Promise.all([
    guildStore.ensureGuild(guildId.value!),
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
