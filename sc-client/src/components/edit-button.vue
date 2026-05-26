<template>
  <q-btn v-if="canEditComputed" flat icon="edit" @click="handleClick" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuestStore } from '../stores/quests';
import { useChannelStore } from '../stores/channel';
import { useConversationStore } from '../stores/conversation';

const props = defineProps<{
  questId?: number | null;
  channelId?: number | null;
  nodeId: number | undefined;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const questStore = useQuestStore();
const channelStore = useChannelStore();
const conversationStore = useConversationStore();

const canEditComputed = computed(() => {
  if (props.channelId) {
    return !!channelStore.canEdit(props.channelId, props.nodeId);
  }
  if (props.questId == null) return false;
  const quest = questStore.getQuestById(props.questId!);
  if (quest && (!quest.is_playing || quest.status === 'finished')) return false;
  return conversationStore.canEdit(props.nodeId);
});

function handleClick() {
  if (canEditComputed.value) {
    emit('click');
  }
}
</script>
