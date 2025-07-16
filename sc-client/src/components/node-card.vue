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
  background-color: #9eb5f3;
  color: #270bc2;
  border: 2px solid black;
}

.node-description {
  background-color: #9eb5f3;
  color: #270bc2;
  padding: 1rem;
  border: 1px solid gray;
  border-radius: 4px;
}

.node-title-bar {
  background-color: lightgray;
  color: #270bc2;
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid gray;
}
</style>
