<template>
  <div >
    <node-tree
      :currentQuestId="questId"
      :currentGuildId="guildId"
      :initialSelectedNodeId="selectedNodeId"
      @tree-selection="selectionChanged"
      :channelId="undefined"
      :isChannel="false"
      :editable="true"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import nodeTree from '../components/node-tree.vue';

const questNodeTreeProps = defineProps<{
  questId?: number;
  guildId?: number;
  selectedNodeId?: number;
}>();

const router = useRouter();

const selectionChanged = async (selectedNodeId: number) => {
  await router.push({
    name: selectedNodeId ? 'quest_page_node' : 'quest_page',
    params: {
      quest_id: String(questNodeTreeProps.questId),
      node_id: selectedNodeId
        ? String(selectedNodeId)
        : undefined,
    },
  });
};
</script>
