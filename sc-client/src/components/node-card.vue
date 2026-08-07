<template>
  <q-card class="node-card">
    <q-card-section class="node-title-bar">
      <h3 class="q-ma-none flex items-center justify-center">
        <IbisButton :node_type="node.node_type" class="q-mr-sm" />
        {{ node.title }}
      </h3>
    </q-card-section>

    <q-separator color="grey-4" />

    <q-card-section>
      <div v-if="node.url" class="q-mb-md">
        <q-btn
          :href="node.url"
          target="_blank"
          type="a"
          color="primary"
          flat
          label="Open Related Link"
          icon="link"
        />
      </div>

      <div class="text-h6">Details</div>
      <q-markdown
        :src="node.description || ''"
        class="node-description q-mt-sm"
      />
    </q-card-section>

    <q-card-actions align="right" class="q-pa-sm">
      <slot name="actions"></slot>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import IbisButton from './ibis-btn.vue';
import { ConversationNode } from '../types';

const { node } = defineProps<{
  node: ConversationNode;
}>();
</script>

<style scoped>
.node-card {
  color: var(--sc-color-text);
}

.node-description {
  background-color: var(--sc-color-bg-muted);
  color: var(--sc-color-text);
  padding: var(--sc-space-16);
  border: 1px solid var(--sc-color-border);
  border-radius: var(--sc-radius-sm);
}

.node-title-bar {
  background-color: var(--sc-color-surface-sunken);
  color: var(--sc-color-text);
  padding: var(--sc-space-16);
  text-align: center;
  border-bottom: 1px solid var(--sc-color-border);
}
</style>
