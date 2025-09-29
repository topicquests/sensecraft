<template>
  <div class="row justify-end guild-header">
    <div class="col-4 text-right q-pr-md">
      <router-link
        class="guild-header"
        v-if="canRegisterToQuest && currentGuild"
        :to="{
          name: 'guild_admin',
          params: { guild_id: currentGuild!.id },
        }"
        >>>go to admin page</router-link
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGuildStore } from '../stores/guilds';
import { useBaseStore } from '../stores/baseStore';
import { permission_enum } from '../enums';

const guildStore = useGuildStore();
const baseStore = useBaseStore();

const currentGuild = computed(() => guildStore.getCurrentGuild);
const currentGuildId = computed(() => guildStore.currentGuild);
const canRegisterToQuest = computed(() =>
  baseStore.hasPermission(permission_enum.joinQuest, currentGuildId.value),
);
</script>
