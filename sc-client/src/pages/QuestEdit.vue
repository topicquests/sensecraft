<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card class="quest-edit-card q-mt-md">
        <div>
          <member-handle></member-handle>
        </div>
        <div class="column items-center">
          <div class="col-12 q-mb-md scoreboard">
            <scoreboard></scoreboard>
          </div>
        </div>
        <div class="row justify-end" style="width: 89%">
          <div class="col-4 text-right q-pr-md">
            <router-link
              class="quest-link"
              :to="{
                name: 'quest_page',
                params: { questId: quest_id },
              }"
              >>>go to quest page</router-link
            >
          </div>
        </div>
        <div class="row justify-center">
          <div class="column items-center">
            <div class="col-12">
              <h4 class="q-pb-sm q-ma-sm">Edit Quest</h4>
            </div>
          </div>
        </div>
        <div class="row justify-center">
          <div
            class="column items-center"
            style="width: 75%"
            v-if="questStore.getCurrentQuest"
          >
            <quest-card
              :thisQuest="questStore.getCurrentQuest"
              :edit="true"
              :create="false"
              v-on:doUpdateQuest="doSubmitQuest"
              style="width: 100%"
            ></quest-card>
          </div>
        </div>

        <div>
          <div class="row justify-center">
            <div class="column items-center">
              <div class="col-12 q-mb-xs q-mt-md q-pa-sm" style="width: 100%">
                <h4 v-if="!node.id">New Conversation Node</h4>
                <h4 v-if="node.id">Update Conversation Node</h4>
              </div>
            </div>
          </div>
          <div class="row justify-center">
            <div
              class="column items-center"
              style="width: 100%"
              v-if="questStore.getCurrentQuest"
            >
              <node-form
                :nodeInput="node"
                :editing="true"
                :ibisTypes="base_ibis_types"
                v-on:action="editNode"
                style="width: 75%"
              />
            </div>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import scoreboard from "../components/score-board.vue";
import memberHandle from "../components/member-handle.vue";
import nodeForm from "../components/node-form.vue";
import questCard from "../components/quest-edit-card.vue";
import { userLoaded } from "../boot/userLoaded";
import { ref } from "vue";
import { useQuestStore } from "src/stores/quests";
import { useConversationStore } from "src/stores/conversation";
import { useQuasar } from "quasar";
import {
  ibis_node_type_enum,
} from "../enums";
import { onBeforeMount } from "vue";
import {  useRoute } from "vue-router"
import { ConversationNode, Quest, QuestData, defaultNodeType } from "src/types";

const $q = useQuasar();
const questStore = useQuestStore();
const conversationStore = useConversationStore();
let quest_id = ref<number>()
const base_ibis_types = [ibis_node_type_enum.question];
const ready = ref(false);
const isAdmin = true;
const route = useRoute();
const defaultNode:defaultNodeType = {
    quest_id: undefined,
    title: "",
    description: "",
    status: "private_draft",
    node_type: "question",
};
function node(): Partial<ConversationNode>|undefined|defaultNodeType {
      return conversationStore.getRootNode || defaultNode;
}
function quest(): QuestData|undefined {
      return questStore.getCurrentQuest;
}
async function editNode(node:ConversationNode) {
  if (node.id) {
    await updateNode(node);
  } else {
    await addNode(node);
  }
}
async function addNode(node:ConversationNode) {
  try {
    const data:ConversationNode|defaultNodeType = { ...node, ...node };
    data.quest_id = quest_id.value;  
    await conversationStore.createConversationNode({ data });
    $q.notify({
      message: `Added node to conversation`,
      color: "positive",
    });
    if(quest_id.value) {
      await conversationStore.fetchRootNode({ quest_id: quest_id.value } );
    }
  } catch (err) {
    console.log("there was an error in adding node ", err);
    $q.notify({
      message: `There was an error adding new node.`,
      color: "negative",
    });
  }
}
async function updateNode(node:ConversationNode) {
  try {
    const data = { ...node, ...node };
    await conversationStore.updateConversationNode(data );
    $q.notify({
      message: `Root node updated`,
      color: "positive",
    });
  } catch (err) {
    console.log("there was an error in adding node ", err);
    $q.notify({
      message: `There was an error adding root node.`,
      color: "negative",
    });
  }
}
function validateStartEnd(quest: Partial<QuestData>) {
  if (quest.start && quest.end && (quest.start < quest.end)) {
    return true;
  }
  return false;
}
async function doSubmitQuest(quest: Partial<Quest>) {
  try {
    if (!validateStartEnd(quest)) {
      throw "End date is before start date";
    }
    await questStore.updateQuest(quest);
    $q.notify({
      message: "Quest was updated successfully",
      color: "positive",
    });
  } catch (err) {
    console.log("there was an error in updating quest ", err);
    $q.notify({
      message: `There was an error updating quest. If this issue persists, contact support.`,
      color: "negative",
    });
  }
}
onBeforeMount(async() =>{
  quest_id.value = Number.parseInt(route.params.quest_id);
  await userLoaded;
  await questStore.setCurrentQuest(quest_id.value);
  await questStore.ensureQuest({ quest_id: quest_id.value });
  await conversationStore.ensureConversation(quest_id.value);
  if (conversationStore.getConversation.length > 0) {
    await conversationStore.fetchRootNode( { quest_id: quest_id.value } );
  }
  ready.value = true;
})

</script>

<style>
.quest-edit-card {
  width: 60%;
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
