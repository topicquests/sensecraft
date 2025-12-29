<template>
  <q-card class="p-md">
    <ul class="quest-ul">
      <li
        v-for="quest in filteredQuests"
        :key="quest.id"
        class="quest-li row items-start"
      >
        <q-btn
          size="sm"
          flat
          icon="info"
          class="q-mr-sm"
          @click="openDialog(quest)"
        />
        <span class="quest-name">{{ quest.name }}</span>
      </li>
    </ul>
    <q-dialog v-model="showDialog" persistent>
      <q-card class="quest-info-dialog">
        <q-card-section>
          <div class="dialog-title">Quest Information</div>
          <div class="quest-name">{{ selectedQuest?.name }}</div>
        </q-card-section>
        <q-card-section>
          <div
            class="quest-description"
            v-html="selectedQuest?.description"
          ></div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" @click="closeDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { QuestData } from '../types';

const questListProps = defineProps<{
  quests: QuestData[];
  status: string[];
}>();

// Filter quests based on selected status
const filteredQuests = computed<QuestData[]>(() =>
  questListProps.quests.filter((item) =>
    questListProps.status.includes(item.status),
  ),
);

// Dialog state
const showDialog = ref(false);
const selectedQuest = ref<QuestData | null>(null);

// Open dialog for a specific quest
function openDialog(quest: QuestData) {
  selectedQuest.value = quest;
  showDialog.value = true;
}

// Close dialog
function closeDialog() {
  showDialog.value = false;
  selectedQuest.value = null;
}
</script>

<style scoped>
.quest-ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.quest-li {
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  align-items: flex-start; /* allows text wrapping */
}

.quest-name {
  font-size: 14px;
  font-weight: 500;
  word-break: break-word; /* wrap long words */
  flex: 1; /* take remaining space */
}

.quest-info-dialog {
  width: 400px;
  max-width: 90vw;
}

.dialog-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.quest-description {
  font-size: 14px;
  color: #444;
}
</style>
