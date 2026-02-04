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
      :row="getChannels"
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
import { computed, ref } from 'vue';
import { useChannelStore } from '../stores/channel';
import { onBeforeUpdate } from 'vue';
import { onBeforeMount } from 'vue';
import { useGuildStore } from '../stores/guilds';
import { useChannelRoleStore } from '../stores/channelRole';

const ChannelListProps = defineProps<{
  guild_id?: number;
  quest_id?: number;
  inPage: boolean;
  title: string;
}>();
const channelStore = useChannelStore();
const guildStore = useGuildStore();
const channelRoleStore = useChannelRoleStore();
const ready = ref(false);
if (ChannelListProps.guild_id !== undefined) {
  guildStore.setCurrentGuild(ChannelListProps.guild_id);
}
const getChannels = computed(() => {
  let channels = ChannelListProps.quest_id
    ? channelStore.getGameChannelsOfQuest(ChannelListProps.quest_id)
    : channelStore.getRootGuildChannels;

  // For game channels, filter to only show channels the user has roles for
  if (ChannelListProps.quest_id && ChannelListProps.guild_id) {
    const userChannelRoles = channelRoleStore.getRolesByQuestForGuild(
      ChannelListProps.quest_id,
      ChannelListProps.guild_id
    );
    const userChannelIds = userChannelRoles.map(role => role.node_id);
    channels = channels.filter(channel => userChannelIds.includes(channel.id));
  }

  return channels;
});
async function ensureData() {
  await channelStore.ensureChannels(ChannelListProps.guild_id!);
}
onBeforeUpdate(async () => {
  await ensureData();
});

onBeforeMount(async () => {
  await ensureData();
  ready.value = true;
});
defineExpose({ getChannels });
</script>

<style>
q-td {
  font-size: 30%;
}
</style>
