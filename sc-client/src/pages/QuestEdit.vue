<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card class="quest-edit-card q-mt-md">
        <div>
          <member-handle></member-handle>
        </div>
        <!-- Link -->
        <div class="row justify-end" style="width: 89%">
          <div class="col-4 text-right q-pr-md">
            <router-link
              v-if="quest_id"
              class="quest-link"
              :to="{ name: 'quest_page', params: { questId: quest_id } }"
            >
              >>>go to quest page
            </router-link>
          </div>
        </div>
        <div class="row justify-center">
          <h4 class="q-pb-sm q-ma-sm">Edit Quest & Conversation Node</h4>
        </div>
        <div class="row justify-center q-mt-md">
          <div class="col-12 col-md-6 q-pa-sm" v-if="currentQuest">
            <quest-card
              :thisQuest="currentQuest"
              :edit="true"
              :create="false"
              :hasRootNode="hasRootNode"
              v-on:doUpdateQuest="doSubmitQuest"
              style="width: 100%"
            />
          </div>
          <div
            class="col-12 col-md-6 q-pa-sm"
            v-if="questStore.getCurrentQuest"
          >
            <div class="q-mb-xs q-mt-md">
              <h4 v-if="!node.id">New Conversation Node</h4>
              <h4 v-else>Update Conversation Node</h4>
            </div>
            <node-form
              :nodeInput="node"
              :editing="true"
              :ibisTypes="base_ibis_types"
              :hideSelectors="true"
              v-on:action="editNode"
              style="width: 100%"
            />
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// Imports
import memberHandle from '../components/member-handle.vue';
import nodeForm from '../components/node-form.vue';
import questCard from '../components/quest-edit-card.vue';
import { waitUserLoaded } from '../app-access';
import { computed, ref } from 'vue';
import { useQuestStore } from '../stores/quests';
import { useConversationStore } from '../stores/conversation';
import { useQuasar } from 'quasar';
import { ibis_node_type_enum } from '../enums';
import { onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import { ConversationNode, Quest, QuestData, defaultNodeType } from '../types';

// Stores
const questStore = useQuestStore();
const conversationStore = useConversationStore();

// Routes
const route = useRoute();

// Quasar
const $q = useQuasar();

// Reactive Variables
const quest_id = ref<number | null>(null);
const ready = ref(false);

// Non Reactive Variables
const base_ibis_types = [ibis_node_type_enum.question];
const defaultNode: defaultNodeType = {
  quest_id: undefined,
  title: '',
  description: '',
  status: 'published',
  node_type: 'question',
};

// Computed Properties
const currentQuest = computed(() => questStore.getCurrentQuest);
const node = computed(() => getNode());
const hasRootNode = computed(() => !!conversationStore.getRootNode?.id);

// Functions
function getNode(): Partial<ConversationNode> | defaultNodeType {
  const rootNode = conversationStore.getRootNode;
  return rootNode || defaultNode;
}
async function editNode(node: ConversationNode) {
  if (node.id) {
    await updateNode(node);
  } else {
    await addNode(node);
  }
}
async function addNode(node: ConversationNode) {
  try {
    const data: Partial<ConversationNode> | defaultNodeType = {
      ...node,
      ...node,
    };
    data.quest_id = quest_id.value!;
    await conversationStore.createConversationNode(data);
    $q.notify({
      message: `Added node to conversation`,
      color: 'positive',
    });
    if (quest_id.value) {
      await conversationStore.fetchRootNode({ quest_id: quest_id.value });
    }
  } catch (err) {
    console.log('there was an error in adding node ', err);
    $q.notify({
      message: `There was an error adding new node.`,
      color: 'negative',
    });
  }
}
async function updateNode(node: ConversationNode) {
  try {
    const data = { ...node, ...node };
    await conversationStore.updateConversationNode(data);
    $q.notify({
      message: `Root node updated`,
      color: 'positive',
    });
  } catch (err) {
    console.log('there was an error in adding node ', err);
    $q.notify({
      message: `There was an error adding root node.`,
      color: 'negative',
    });
  }
}
function validateStartEnd(quest: Partial<QuestData>) {
  if (quest.start && quest.end && quest.start < quest.end) {
    return true;
  }
  return false;
}
async function doSubmitQuest(quest: Partial<Quest>) {
  try {
    if (!validateStartEnd(quest)) {
      throw 'End date is before start date';
    }
    await questStore.updateQuest(quest);
    $q.notify({
      message: 'Quest was updated successfully',
      color: 'positive',
    });
  } catch (err) {
    console.log('there was an error in updating quest ', err);
    $q.notify({
      message: `There was an error updating quest. If this issue persists, contact support.`,
      color: 'negative',
    });
  }
}

// Lifecycle Hooks
onBeforeMount(async () => {
  await waitUserLoaded();
  if (typeof route.params.quest_id === 'string') {
    quest_id.value = Number.parseInt(route.params.quest_id);
  }
  const questId = quest_id.value;
  if (typeof questId === 'number') {
    questStore.setCurrentQuest(questId);
    await questStore.ensureQuest({ quest_id: questId });
    await conversationStore.ensureConversation(questId);
    if (conversationStore.getConversation!.length > 0) {
      await conversationStore.fetchRootNode({ quest_id: questId });
    }
  }
  ready.value = true;
});
</script>

<style>
.quest-edit-card {
  width: 80%;
}

.name-field {
  transition: width 0.36s;
  width: 1500px;
}
.details {
  max-width: 1500px;
  min-height: 800px;
  overflow: auto;
  overflow-wrap: normal;
}

h4 {
  text-align: center;
}
.q-editor {
  width: 80%;
  border: 1px solid black;
}
.quest-link {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12pt;
}
@media only screen and (max-width: 1300px) {
  .quest-edit-card {
    width: 80%;
  }
}
@media only screen and (max-width: 800px) {
  .quest-edit-card {
    width: 98%;
  }
}
</style>
