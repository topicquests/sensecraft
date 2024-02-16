<template>
  <q-card v-if="ready">
    <router-link
      v-if="!inPage && quest_id"
      :to="{
        name: 'game_channel_list',
        params: { guild_id: guild_id, quest_id: quest_id },
      }"
      >{{ ChannelListProps.title }}</router-link
    >
    <router-link
      v-else-if="!inPage"
      :to="{ name: 'guild_channel_list', params: { guild_id: guild_id } }"
      >{{ ChannelListProps.title }}</router-link
    >
    <p v-else>{{ ChannelListProps.title }}</p>
    <q-list
      style="color: darkgreen; background-color: lightblue"
      :data="getChannels"
      row-key="desc"
    >
      <q-item v-for="channel in getChannels" :key="channel.id">
        <router-link
          v-if="quest_id"
          :to="{
            name: 'game_channel_conversation',
            params: {
              guild_id: guild_id,
              quest_id: quest_id,
              channel_id: channel.id,
            },
          }"
          >{{ channel.title }}</router-link
        >
        <router-link
          v-else
          :to="{
            name: 'guild_channel_conversation',
            params: {
              guild_id: channel.guild_id,
              channel_id: channel.id,
            },
          }"
          >{{ channel.title }}</router-link
        >
      </q-item>
    </q-list>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ConversationNode } from "../types";
import { userLoaded } from "../boot/userLoaded";
import { useChannelStore } from "src/stores/channel";
import { onBeforeUpdate } from "vue";
import { onBeforeMount } from "vue";

const ChannelListProps = defineProps<{
    guild_id: number;
    quest_id: number;
    inPage: boolean;
    title: string;
}>();
const channelStore = useChannelStore();
const  ready = ref(false);

function getChannels():ConversationNode[] {
  return ChannelListProps.quest_id
    ? channelStore.getGameChannelsOfQuest(ChannelListProps.quest_id)
    : channelStore.getGuildChannels;
};
async function ensureData() {
  await channelStore.ensureChannels(ChannelListProps.guild_id);
};
onBeforeUpdate(async () =>{
    await ensureData();
});

onBeforeMount(async () => {
  await userLoaded;
  ensureData();
  ready.value = true;
});
</script>

<style>
q-td {
  font-size: 30%;
}
</style>
