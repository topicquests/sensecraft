<template>
  <q-card class="ibis-card">
    <!-- Header -->
    <div class="ibis-card-header">
      <q-img :src="icon" :alt="`${title} icon`" class="ibis-icon q-mr-sm" />
      <span class="text-subtitle1">{{ title }}</span>
    </div>

    <!-- Items list -->
    <div v-if="items!.length" class="ibis-card-content">
      <div v-for="node in items" :key="node.id" class="q-mb-sm">
        <a
          href="#"
          class="text-primary hover:underline"
          @click.prevent="$emit('select', node.id)"
        >
          <div class="text-body2">{{ node.title }}</div>
          <div class="text-caption text-grey-7">
            {{ getGuildName(node.guild_id) }}
          </div>
        </a>
      </div>
    </div>
    <div v-else class="text-caption text-grey-6 q-pa-sm">No entries</div>
  </q-card>
</template>

<script setup lang="ts">
import { QTreeNode } from '../types';
import { useGuildStore } from '../stores/guilds';

const props = defineProps<{
  title: string;
  icon: string;
  items?: QTreeNode[];
}>();

const guildStore = useGuildStore();

function getGuildName(id?: number) {
  return id
    ? guildStore.getGuildById(id)?.name || 'Unknown Guild'
    : 'Unknown Guild';
}
</script>

<style scoped>
.ibis-card {
  min-width: 200px;
  height: 200px;
  border-radius: var(--sc-radius-lg);
  display: flex;
  flex-direction: column;
}

.ibis-card-header {
  display: flex;
  align-items: center;
  padding: var(--sc-space-8) var(--sc-space-16);
  background-color: var(--sc-color-bg-muted);
  font-weight: var(--sc-font-weight-semibold);
  border-bottom: 1px solid var(--sc-color-border);
}

.ibis-card-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--sc-space-12) var(--sc-space-16);
}

.ibis-icon {
  width: 20px;
  height: 20px;
}
</style>
