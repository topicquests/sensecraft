<template>
  <div class="row justify-center q-mt-lg" style="background-color: #f1c40f">
    <div>
      <h2 class="quest-name" v-if="currentQuest">
        {{ currentQuest.name }}
        <q-btn
          v-if="currentQuest.description"
          class="q-ml-xs"
          size="md"
          :flat="true"
          icon="info"
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
</style>
