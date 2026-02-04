<template>
  <div>
    <div
      v-if="shouldShowGuildChannels && isMember"
      class="q-pa-md q-gutter-sm"
      data-testid="guild-channels-container"
    >
      <channel-list
        :guild_id="rightDrawerProps.currentGuild!.id"
        :inPage="false"
        title="Guild Channels"
      />
    </div>
    <div
      v-if="canShowBothChannels && isMember && isPlayingInQuest"
      class="q-pa-md q-gutter-sm"
    >
      <channel-list
        :guild_id="rightDrawerProps.currentGuild!.id"
        :quest_id="rightDrawerProps.currentQuest!.id"
        :inPage="false"
        title="Game Channels"
      />
    </div>
    <!-- Quest Roles for Game Leaders -->
    <div
      v-if="isGameLeader && rightDrawerProps.currentQuest"
      class="q-pa-md q-gutter-sm"
    >
      <q-card>
        <router-link
          :to="{
            name: 'guild',
            params: { guild_id: rightDrawerProps.currentGuild!.id },
          }"
        >
          Quest Roles
        </router-link>
        <q-list>
          <q-item
            v-for="role in questRoles"
            :key="role.id"
            :label="role.name"
          />
        </q-list>
      </q-card>
    </div>
  </div>
</template>
<script setup lang="ts">
import { GuildData, QuestData } from '../types';
import channelList from '../components/ChannelListComponent.vue';
import { computed, onBeforeMount, watch } from 'vue';
import { useChannelStore } from '../stores/channel';
import { useGuildStore } from '../stores/guilds';
import { useQuestStore } from '../stores/quests';
import { useMemberStore } from '../stores/member';

const channelStore = useChannelStore();
const guildStore = useGuildStore();
const questStore = useQuestStore();
const memberStore = useMemberStore();

const rightDrawerProps = defineProps<{
  currentQuest?: QuestData;
  currentGuild?: GuildData;
}>();
const isMember = computed<boolean>({
  get: () => {
    if (rightDrawerProps.currentGuild) {
      return !!guildStore.isGuildMember(rightDrawerProps.currentGuild.id);
    }
    return false; // or another default fallback
  },
  set: (value) => {
    return value;
  },
});

const isPlayingInQuest = computed<boolean>({
  get: () => {
    if (rightDrawerProps.currentQuest) {
      return !!questStore.isPlayingQuestInGuild(
        rightDrawerProps.currentQuest.id,
        rightDrawerProps.currentGuild!.id,
      );
    }
    return false;
  },
  set: (value) => {
    return value;
  },
});
const shouldShowGuildChannels = computed(() => !!rightDrawerProps.currentGuild);
const canShowBothChannels = computed(
  () => !!rightDrawerProps.currentGuild && !!rightDrawerProps.currentQuest,
);

const isGameLeader = computed(() => {
  if (!rightDrawerProps.currentQuest || !rightDrawerProps.currentGuild) return false;
  const memberId = memberStore.getUserId;
  if (!memberId) return false;
  return questStore.isGameLeaderForQuestInGuild(
    memberId,
    rightDrawerProps.currentQuest.id,
    rightDrawerProps.currentGuild.id
  );
});

const questRoles = computed(() => {
  if (!rightDrawerProps.currentQuest || !rightDrawerProps.currentGuild) return [];
  return questStore.getAllRolesInQuestForGuild(
    rightDrawerProps.currentQuest.id,
    rightDrawerProps.currentGuild.id
  );
});
watch(isMember, async () => {
  const guildId = channelStore.getChannelsCurrentGuildId;
  if (guildId !== undefined) {
    await channelStore.ensureChannels(guildId);
  }
});
onBeforeMount(async () => {
  const guildId = channelStore.getChannelsCurrentGuildId;
  if (guildId !== undefined) {
    await channelStore.ensureChannels(guildId);
  }
});
</script>
