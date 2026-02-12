<template>
  <q-card v-if="ready">
    <router-link
      v-if="!inPage && quest_id && guild_id"
      :to="{
        name: 'game_channel_list',
        params: { guild_id: guild_id.toString(), quest_id: quest_id.toString() },
      }"
      >{{ ChannelListProps.title }}</router-link
    >
    <router-link
      v-else-if="!inPage && guild_id"
      :to="{ name: 'guild_channel_list', params: { guild_id: guild_id.toString() } }"
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
          v-if="quest_id && guild_id"
          :to="{
            name: 'game_channel_conversation',
            params: {
              guild_id: guild_id.toString(),
              quest_id: quest_id.toString(),
              channel_id: channel.id.toString(),
            },
          }"
          >{{ channel.title }}</router-link
        >
        <router-link
          v-else-if="channel.guild_id"
          :to="{
            name: 'guild_channel_conversation',
            params: {
              guild_id: channel.guild_id.toString(),
              channel_id: channel.id.toString(),
            },
          }"
          >{{ channel.title }}</router-link
        >
        <span v-else>{{ channel.title }}</span>
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
import { useQuestStore } from '../stores/quests';
import { useMemberStore } from '../stores/member';

const ChannelListProps = defineProps<{
  guild_id?: number;
  quest_id?: number;
  inPage: boolean;
  title: string;
}>();
const channelStore = useChannelStore();
const guildStore = useGuildStore();
const channelRoleStore = useChannelRoleStore();
const questStore = useQuestStore();
const memberStore = useMemberStore();
const ready = ref(false);
if (ChannelListProps.guild_id !== undefined) {
  guildStore.setCurrentGuild(ChannelListProps.guild_id);
}
const getChannels = computed(() => {
  let channels = ChannelListProps.quest_id
    ? channelStore.getGameChannelsOfQuest(ChannelListProps.quest_id)
    : channelStore.getRootGuildChannels;

  // For game channels, filter to only show channels the user has roles for
  // UNLESS the user is a game leader, then show all role channels
  if (ChannelListProps.quest_id && ChannelListProps.guild_id) {
    const userId = memberStore.getUserId;
    const isGameLeader = userId ? questStore.isGameLeaderForQuestInGuild(
      ChannelListProps.quest_id,
      userId,
      ChannelListProps.guild_id
    ) : false;

    if (!isGameLeader) {
      // Regular users: only show channels for roles they have via casting_role
      // The RLS policy ensures we only get channel_roles for roles we have
      const userChannelRoles = channelRoleStore.getRolesByQuestForGuild(
        ChannelListProps.quest_id,
        ChannelListProps.guild_id
      );
      const userChannelIds = userChannelRoles.map(role => role.node_id);
      channels = channels.filter(channel => userChannelIds.includes(channel.id));
    } else {
      // Game leaders: show all role channels for this quest/guild
      const allChannelRoles = channelRoleStore.getRolesByQuestForGuild(
        ChannelListProps.quest_id,
        ChannelListProps.guild_id
      );
      const allChannelIds = allChannelRoles.map(role => role.node_id);
      // Filter to show only channels that have channel roles
      channels = channels.filter(channel => allChannelIds.includes(channel.id));
    }
  }

  return channels;
});
async function ensureData() {
  await channelStore.ensureChannels(ChannelListProps.guild_id!);
  // Ensure channel roles are loaded for this guild/quest
  if (ChannelListProps.guild_id) {
    await channelRoleStore.fetchChannelRoles({ 
      guild_id: ChannelListProps.guild_id,
      quest_id: ChannelListProps.quest_id
    });
  }
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
