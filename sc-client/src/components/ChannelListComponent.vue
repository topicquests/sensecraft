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
      class="channel-list"
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

  if (ChannelListProps.quest_id && ChannelListProps.guild_id) {
    const userId = memberStore.getUserId;
    const isGameLeader = userId ? questStore.isGameLeaderForQuestInGuild(
      userId,
      ChannelListProps.quest_id,      ChannelListProps.guild_id
    ) : false;
    channels = channels.filter(channel => channel.guild_id === ChannelListProps.guild_id);

    if (!isGameLeader) {
      const userChannelRoles = channelRoleStore.getRolesByQuestForGuild(
        ChannelListProps.quest_id,
        ChannelListProps.guild_id
      );
      const userChannelIds = userChannelRoles.map(role => role.node_id);
      channels = channels.filter(
        channel => !channel.draft_for_role_id || userChannelIds.includes(channel.id)
      );
    }
    // Game leaders: show all game channels for this quest/guild (no role filter).
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

<style scoped>
.channel-list :deep(a) {
  color: inherit;
  font-weight: var(--sc-font-weight-medium);
}

.channel-list :deep(a:hover) {
  text-decoration: underline;
}
</style>
