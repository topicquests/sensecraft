<template>
  <div class="row justify-center q-mt-lg quest-details-row">
    <div>
      <h2 class="quest-name" v-if="currentQuest">
        {{ currentQuest.name }}
        <q-btn
          v-if="currentQuest.description"
          class="q-ml-xs"
          size="lg"
          :flat="true"
          icon="info"
          color="info"
          @click="showDialog = true"
        />
      </h2>
      <q-dialog v-model="showDialog" persistent>
        <q-card style="max-height: 1000px">
          <q-card-section>
            <div class="text-h6">Quest Information</div>
            <div>{{ currentQuest.name }}</div>
          </q-card-section>
          <q-card-section style="max-height: 300px; overflow-y: auto">
            <div v-html="currentQuest.description"></div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Close" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <div
        v-if="currentQuest && currentQuest.status === 'finished'"
        class="quest-finished-notice"
      >
        This quest is finished. No more plays can be done.
      </div>
    </div>
    <router-link
      v-if="currentQuest"
      :to="{
        name: 'quest_teams',
        params: { quest_id: currentQuest.id },
      }"
      class="q-ml-sm q-pt-lg q-mt-md"
    >
      Teams
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuestStore } from '../stores/quests';

const questStore = useQuestStore();
const showDialog = ref(false);
const currentQuest = computed(() => questStore.getCurrentQuest!);
</script>

<style scoped>
.quest-details-row {
  background-color: var(--sc-color-bg-muted);
}
.quest-name {
  padding: var(--sc-space-4);
  margin-top: var(--sc-space-16);
}
.quest-finished-notice {
  color: var(--sc-color-error);
  font-weight: var(--sc-font-weight-bold);
  text-align: center;
  padding: var(--sc-space-4) var(--sc-space-8);
  margin-top: var(--sc-space-4);
  border: 1px solid var(--sc-color-error);
  border-radius: var(--sc-radius-sm);
  background-color: var(--sc-color-error-subtle);
}
</style>
