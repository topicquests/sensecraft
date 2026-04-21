<template>
  <div class="row justify-center q-mt-lg" style="background-color: #f1c40f">
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
.quest-name {
  text-decoration: underline;
  padding: 5px;
  margin-top: 16px;
}
.quest-finished-notice {
  color: #c10015;
  font-weight: bold;
  text-align: center;
  padding: 4px 8px;
  margin-top: 4px;
  border: 1px solid #c10015;
  border-radius: 4px;
  background-color: #fff;
}
</style>
