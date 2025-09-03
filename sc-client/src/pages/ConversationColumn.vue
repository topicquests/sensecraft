<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card class="node-card q-mt-md q-pa-md">
        <q-card class="q-mt-md q-pa-md">
          <div class="row justify-end" style="width: 92%">
            <member-handle></member-handle>
          </div>
          <div class="row justify-center q-mt-lg">
            <router-link
              v-if="questId"
              :to="{
                name: 'quest_page',
                params: { quest_id: questId },
              }"
            >
              Quest Play Page
            </router-link>
          </div>
          <q-card>
            <div class="row justify-center q-mb-sm">
              <div>
                <h5>
                  <q-icon :name="getIcon(node!.id)" class="q-mr-sm" />
                  {{ node?.title }}
                </h5>
              </div>
            </div>
            <div class="row justify-center">
              <div class="column">
                <q-card class="q-mb-md scrollable-description">
                  <div class="content-container">
                    <div class="content" v-html="node!.description"></div>
                    <section v-if="node!.url || node!.node_type == 'reference'">
                      <div class="row q-ml-md">
                        <a v-bind:href="node!.url" target="_blank">
                          <span> url: </span> {{ node!.url }}
                        </a>
                      </div>
                    </section>
                  </div>
                   <q-card-actions align="right" class="q-pa-sm">
          <EditButton
            :nodeId="selectedNode!.id"
            :questId="questId"
            class="q-mr-sm"
            @click="editNode(selectedNode!.id)"
          />
          <q-btn
            v-if="canAddChild()"
            flat
            color="primary"
            icon="add"
            label="Add Child"
            @click="addChildToNode(selectedNodeId!)"
          />
        </q-card-actions>
                </q-card>
              </div>
            </div>
            <div class="row justify-center items-center">
              <div class="col-4 q-pa-sm" style="width: 100%">
                <q-card class="q-ma-md">
                  <div
                    class="row justify-center items-center q-pb-lg q-pt-lg"
                    style="flex-wrap: wrap"
                  >
                    <q-card
                      v-if="parent"
                      class="q-pl-sm q-ml-md q-mb-md"
                      style="
                        min-width: 200px;
                        height: 100px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                      "
                    >
                      <span>Parent Node</span>
                      <div>
                        <q-icon
                          :name="getIcon(parent!.id)"
                          style="width: 30px; height: 30px"
                          class="q-mb-md"
                        />
                      </div>
                      <div>
                        <a
                          class="q-ml-md q-mr-md"
                          href="#"
                          @click.prevent="updateNodeId(parent.id)"
                        >
                          {{ parent!.title }}
                        </a>
                      </div>
                    </q-card>
                  </div>
                </q-card>
              </div>
            </div>
            <div class="row justify-center items-center">
              <div class="col-4 q-pa-sm" style="width: 100%">
                <q-card class="q-ma-md">
                  <div
                    class="row justify-center items-center q-pb-lg q-pt-lg"
                    style="flex-wrap: wrap"
                  >
                    <!-- First Card -->
                    <q-card
                      class="q-pl-sm q-ml-md q-mb-md"
                      style="
                        width: 17%;
                        min-width: 200px;
                        height: 200px;
                        margin-right: 16px;
                      "
                    >
                      <!-- Header Nodes with rounded corners and title in the same row -->
                      <div
                        class="row q-pa-md q-pt-md q-pb-sm items-center"
                        style="
                          border-top-left-radius: 8px;
                          border-top-right-radius: 8px;
                          background-color: #f5f5f5;
                        "
                      >
                        <q-img
                          :src="issueIcon"
                          alt="Issue Icon"
                          class="icon"
                          style="margin-right: 8px"
                        />
                        <span>Question</span>
                      </div>
                      <!-- Question Data -->
                      <div
                        v-if="filteredQuestions.length"
                        style="height: calc(100% - 56px); overflow-y: auto"
                      >
                        <div
                          v-for="question in filteredQuestions"
                          :key="question!.id"
                          style="margin: 0"
                        >
                          <a
                            href="#"
                            @click.prevent="updateNodeId(question!.id)"
                          >
                            <div>{{ question?.title }}</div>
                            <div style="font-size: 0.875rem; color: #666">
                              {{
                                guildStore.getGuildById(question!.guild_id!)
                                  ?.name || 'Unknown Guild'
                              }}
                            </div>
                          </a>
                        </div>
                      </div>
                    </q-card>
                    <!-- Second Card -->
                    <q-card
                      class="q-pl-sm q-ml-md q-mb-md"
                      style="
                        width: 17%;
                        min-width: 200px;
                        height: 200px;
                        margin-right: 16px;
                      "
                    >
                      <!-- Header Nodes with rounded corners and title in the same row -->
                      <div
                        class="row q-pa-md q-pt-md q-pb-sm items-center"
                        style="
                          border-top-left-radius: 8px;
                          border-top-right-radius: 8px;
                          background-color: #f5f5f5;
                        "
                      >
                        <q-img
                          :src="positionIcon"
                          alt="Position Icon"
                          class="icon"
                          style="margin-right: 8px"
                        />
                        <span>Answer</span>
                      </div>
                      <!-- Answer Data -->
                      <div
                        v-if="filteredAnswers.length"
                        style="height: calc(100% - 56px); overflow-y: auto"
                      >
                        <div
                          v-for="answer in filteredAnswers"
                          :key="answer!.id"
                          style="margin: 0"
                        >
                          <a href="#" @click.prevent="updateNodeId(answer!.id)">
                            <div>{{ answer?.title }}</div>
                            <div style="font-size: 0.875rem; color: #666">
                              {{
                                guildStore.getGuildById(answer.guild_id!)
                                  ?.name || 'Unknown Guild'
                              }}
                            </div>
                          </a>
                        </div>
                      </div>
                    </q-card>
                    <!-- Third Card -->
                    <q-card
                      class="q-pl-sm q-ml-md q-mb-md"
                      style="
                        width: 17%;
                        min-width: 200px;
                        height: 200px;
                        margin-right: 16px;
                      "
                    >
                      <!-- Header Nodes -->
                      <div
                        class="row q-pa-md q-pt-md q-pb-sm items-center"
                        style="
                          border-top-left-radius: 8px;
                          border-top-right-radius: 8px;
                          background-color: #f5f5f5;
                        "
                      >
                        <q-img
                          :src="proIcon"
                          alt="Pro Icon"
                          class="icon"
                          style="margin-right: 8px"
                        />
                        <span>Pro</span>
                      </div>
                      <!-- Pro Data -->
                      <div
                        v-if="filteredPro.length"
                        style="height: calc(100% - 56px); overflow-y: auto"
                      >
                        <div
                          v-for="pro in filteredPro"
                          :key="pro!.id"
                          style="margin: 0"
                        >
                          <a href="#" @click.prevent="updateNodeId(pro!.id)">
                            <div>{{ pro?.title }}</div>
                            <div style="font-size: 0.875rem; color: #666">
                              {{
                                guildStore.getGuildById(pro!.guild_id!)?.name ||
                                'Unknown Guild'
                              }}
                            </div>
                          </a>
                        </div>
                      </div>
                    </q-card>
                    <!-- Fourth Card -->
                    <q-card
                      class="q-pl-sm q-ml-md q-mb-md"
                      style="
                        width: 17%;
                        min-width: 200px;
                        height: 200px;
                        margin-right: 16px;
                      "
                    >
                      <!-- Header Nodes -->
                      <div
                        class="row q-pa-md q-pt-md q-pb-sm items-center"
                        style="
                          border-top-left-radius: 8px;
                          border-top-right-radius: 8px;
                          background-color: #f5f5f5;
                        "
                      >
                        <q-img
                          :src="conIcon"
                          alt="Con Icon"
                          class="icon"
                          style="margin-right: 8px"
                        />
                        <span>Con</span>
                      </div>
                      <!-- Con Data -->
                      <div
                        v-if="filteredCon.length"
                        style="height: calc(100% - 56px); overflow-y: auto"
                      >
                        <div
                          v-for="con in filteredCon"
                          :key="con!.id"
                          style="margin: 0"
                        >
                          <a href="#" @click.prevent="updateNodeId(con!.id)">
                            <div>{{ con?.title }}</div>
                            <div style="font-size: 0.875rem; color: #666">
                              {{
                                guildStore.getGuildById(con.guild_id!)?.name ||
                                'Unknown Guild'
                              }}
                            </div>
                          </a>
                        </div>
                      </div>
                    </q-card>
                    <!-- Fifth Card -->
                    <q-card
                      class="q-pl-sm q-ml-md q-mb-md"
                      style="width: 17%; min-width: 200px; height: 200px"
                    >
                      <!-- Header Nodes -->
                      <div
                        class="row q-pa-md q-pt-md q-pb-sm items-center"
                        style="
                          border-top-left-radius: 8px;
                          border-top-right-radius: 8px;
                          background-color: #f5f5f5;
                        "
                      >
                        <q-img
                          :src="refIcon"
                          alt="Ref Icon"
                          class="icon"
                          style="margin-right: 8px"
                        />
                        <span>Ref</span>
                      </div>
                      <!-- Ref Data -->
                      <div
                        v-if="filteredRef.length"
                        style="height: calc(100% - 56px); overflow-y: auto"
                      >
                        <div
                          v-for="ref in filteredRef"
                          :key="ref!.id"
                          style="margin: 0"
                        >
                          <a href="#" @click.prevent="updateNodeId(ref!.id)">
                            <div>{{ ref?.title }}</div>
                            <div style="font-size: 0.875rem; color: #666">
                              {{
                                guildStore.getGuildById(ref!.guild_id!)?.name ||
                                'Unknown Guild'
                              }}
                            </div>
                          </a>
                        </div>
                      </div>
                    </q-card>
                  </div>
                </q-card>
              </div>
            </div>
          </q-card>
        </q-card>
      </q-card>
    </div>
    <node-form
    :ref="nodeFormRef(selectedNodeId!)"
    :nodeInput="selectedNode"
    :allowAddChild="false"
    :ibisTypes="selectedIbisTypes"
    :editing="true"
    :roles="roleStore.getRoles"
    :allowChangeMeta="allowChangeMeta"
    :pubFn="calcSpecificPubConstraints"
    @action="confirmEdit"
    @cancel="cancel"
  />
  </q-page>
</template>
<script setup lang="ts">
// Imports
import { ComponentPublicInstance, computed, nextTick, onBeforeMount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { waitUserLoaded } from '../app-access';
import { ibis_child_types, useConversationStore } from '../stores/conversation';
import { ConversationNode, QTreeNode } from '../types';
import { ibis_node_type_enum, ibis_node_type_list, ibis_node_type_type, publication_state_enum, publication_state_list, publication_state_type } from '../enums';
import issueIcon from '../statics/images/ibis/issue_sm.png';
import positionIcon from '../statics/images/ibis/position_sm.png';
import proIcon from '../statics/images/ibis/plus_sm.png';
import conIcon from '../statics/images/ibis/minus_sm.png';
import refIcon from '../statics/images/ibis/reference_sm.png';
import memberHandle from '../components/member-handle.vue';
import { useGuildStore } from '../stores/guilds';
import { useQuestStore } from '../stores/quests';
import { useRoleStore } from '../stores/role';
import EditButton from '../components/edit-button.vue';
import NodeForm from '../components/node-form.vue';
import { useQuasar } from 'quasar';

type NodeFormInstance = ComponentPublicInstance<{
  setFocus: () => void;
}>;

// Quasar
const $q = useQuasar();

// Stores
const conversationStore = useConversationStore();
const guildStore = useGuildStore();
const questStore = useQuestStore();
const roleStore = useRoleStore();

// Route
const route = useRoute();

// Reactive Variables
const q = ref<Partial<QTreeNode[]> | undefined>(undefined);
const tree = ref<Partial<QTreeNode[]> | undefined>(undefined);
const nodeId = ref();
const questId = ref<number | undefined>();
const ready = ref(false);
const newNode = ref({});
const editable = ref<boolean>(true)
const allowChangeMeta = ref(false);
const editingNodeId = ref<number | null>(null);
const form = ref<NodeFormInstance | null>(null);
const nodeForms = ref<Record<string, NodeFormInstance | null>>({});
const addingChildToNodeId = ref<number | null>(null);
const selectedIbisTypes = ref<any[]>([]);
const parseNodeId = (param: string | string[] | undefined): number | undefined => {
  if (typeof param === 'string') {
    return Number.parseInt(param);
  } else if (Array.isArray(param) && param.length > 0) {
    return Number.parseInt(param[0]);
  }
  return undefined;
};
const selectedNodeId = ref<number | undefined>(parseNodeId(route.params.node_id));

// non reactive variables
let baseNodePubStateConstraints: publication_state_type[];
let childIbisTypes: ibis_node_type_type[] = ibis_node_type_list;

// Computed Properties
const currentGuildId = computed(() =>
  guildStore.getCurrentGuild
)
const canAddChild = computed(() => {
  return () => {
    return (
      canAddTo() &&
      !editingNodeId.value &&
      !addingChildToNodeId.value
    );
  };
});
const selectedNode = computed(() => {
  if (selectedNodeId.value != null) {
    return conversationStore.getConversationNodeById(selectedNodeId.value);
  }
  return undefined;
});
const node = computed(() =>
  conversationStore.getConversationNodeById(nodeId.value),
);
const parent = computed((): QTreeNode | undefined => {
  if (node.value!.parent_id && node.value!.parent_id) {
    return conversationStore.getConversationNodeById(node.value!.parent_id);
  }
  return undefined;
});
const filteredQuestions = computed(
  () =>
    q.value?.filter(
      (item) => item!.node_type === ibis_node_type_enum.question,
    ) || [],
);
const filteredAnswers = computed(() =>
  filterNodesByType(q.value, ibis_node_type_enum.answer),
);
const filteredPro = computed(
  () =>
    q.value?.filter((item) => item!.node_type === ibis_node_type_enum.pro) ||
    [],
);
const filteredCon = computed(() =>
  filterNodesByType(q.value, ibis_node_type_enum.con),
);
const filteredRef = computed(
  () =>
    q.value?.filter(
      (item) => item!.node_type === ibis_node_type_enum.reference,
    ) || [],
);
function getIcon(id: number) {
  const treeIcon = findNodeById(tree.value, id);
  return treeIcon?.icon;
}

// Watches
watch(nodeId, () => {
  if (nodeId.value) getIcon(nodeId.value);
});

// Functions
function nodeFormRef(nodeId: string | number) {
  return (el: Element | NodeFormInstance | null) => {
    console.log('nodeFormRef called for nodeId', nodeId, el);

    if (el && typeof el === 'object' && '$' in el) {
      nodeForms.value[`editForm_${nodeId}`] = el;
    } else {
      nodeForms.value[`editForm_${nodeId}`] = null;
    }
    if (editingNodeId.value === nodeId) {
      form.value = nodeForms.value[`editForm_${nodeId}`];
    }
  };
}
function cancel() {
  editingNodeId.value = null;
  addingChildToNodeId.value = null;
  newNode.value = {};
}
function addChildToNode(nodeId: number | null) {
  const formKey = `addChildForm_${nodeId}`;
  editingNodeId.value = null;
  const parent = getNode(nodeId!);
  const parent_ibis_type = parent!.node_type;
  childIbisTypes = ibis_child_types(parent_ibis_type);
  allowChangeMeta.value = parent!.meta === 'conversation';
  newNode.value = {
    status: 'private_draft',
    node_type: childIbisTypes[0],
    parent_id: nodeId!,
    quest_id: parent!.quest_id,
    guild_id: guildStore.getCurrentGuild!.id,
    meta: parent!.meta,
  };
  calcPublicationConstraints(newNode.value);
  addingChildToNodeId.value = nodeId;
  setTimeout(() => {
    form.value = nodeForms.value[formKey];
    if (form.value) form.value.setFocus();
  }, 0);
}
async function confirmEdit(node: Partial<ConversationNode>) {
  try {
    await conversationStore.updateConversationNode(node);
    cancel();

    editingNodeId.value = null;
    $q.notify({
      message: `node updated`,
      color: 'positive',
    });
  } catch (err) {
    console.log('there was an error in adding node ', err);
    $q.notify({
      message: `There was an error updating node.`,
      color: 'negative',
    });
  }
}
function updateNodeId(id: number) {
  nodeId.value = id;
  initialize();
}
function getNode(nodeId: number): ConversationNode | null {
  const node = conversationStore.getConversationNodeById(nodeId);
  return node ?? null;
}
function filterNodesByType(
  nodes: Partial<QTreeNode[]> | undefined,
  type: ibis_node_type_enum,
): QTreeNode[] {
  const result: QTreeNode[] = [];
  if (!nodes) return result;
  for (const node of nodes) {
    if (node!.node_type === type) {
      result.push(node!);
    }
    if (node!.children && node!.children.length > 0) {
      result.push(...filterNodesByType(node!.children, type));
    }
  }
  return result;
}
function canAddTo(): boolean {
  const quest = questStore.getQuestById(
    questId.value!
  );
  if (quest) {
    return (
      (quest.is_playing || quest.is_quest_member) && quest.status != 'finished'
    );
  }
  return false;
}
function calcPublicationConstraints(node: Partial<ConversationNode>) {
  if (!currentGuildId.value) {
    baseNodePubStateConstraints = [
      publication_state_enum.private_draft,
      publication_state_enum.published,
    ];
    return;
  }
  // a node publication state must be <= its parent's and >= all its children
  const pub_states = [...publication_state_list];
  if (!node) return [];
  if (node.parent_id) {
    const parent = getNode(node.parent_id);
    if (parent) {
      const pos = pub_states.indexOf(parent.status);
      if (pos >= 0) {
        pub_states.splice(pos + 1);
      }
    }
  }
  if (node.id) {
    const children_status = conversationStore
      .getChildrenOf(node.id)!
      .map((n) => n!.status);
    if (children_status.length > 0) {
      children_status.sort(
        (a, b) =>
          publication_state_list.indexOf(a) - publication_state_list.indexOf(b),
      );
      const pos = pub_states.indexOf(children_status[0]);
      if (pos > 0) pub_states.splice(0, pos);
    }
  }
  if (node.meta == 'channel') {
    // clamp to guild
    const pos = pub_states.indexOf('proposed');
    if (pos >= 0) pub_states.splice(pos);
  }
  baseNodePubStateConstraints = pub_states;
}
function calcSpecificPubConstraints(node: Partial<ConversationNode>) {
  if (node.meta == 'channel' || !currentGuildId.value)
    return baseNodePubStateConstraints;
  const pub_states = [...baseNodePubStateConstraints];
  if (node.meta == 'meta') {
    // clamp to guild
    const pos = pub_states.indexOf('proposed');
    if (pos >= 0) pub_states.splice(pos);
  }
  const node_type = node.node_type;
  if (node_type && node.quest_id) {
    const max_state = questStore.getMaxPubStateForNodeType(
      node.quest_id,
      node_type,
    );
    const pos = pub_states.indexOf(max_state);
    if (pos >= 0) pub_states.splice(pos + 1);
  }
  const posCurrent = pub_states.indexOf(node.status!);
  if (posCurrent < 0) {
    console.error('current node status not in pub_states');
    pub_states.push(node.status!);
  }
  return pub_states;
}
async function editNode(nodeId: number) {
  const selectedNodeLocal = getNode(nodeId);
  if (!selectedNodeLocal) {
    console.warn('Node not found:', nodeId);
    return;
  }
  function getNode(nodeId: number): ConversationNode | null {
  const node = conversationStore.getConversationNodeById(nodeId);
  return node ?? null;
  }

  // Clone the node for editing
  newNode.value = { ...selectedNodeLocal };
  addingChildToNodeId.value = null;

  // Determine allowed child types and meta permissions
  if (selectedNodeLocal.parent_id != null) {
    const parent = getNode(selectedNodeLocal.parent_id);
    selectedIbisTypes.value = parent?.node_type
      ? ibis_child_types(parent.node_type)
      : [];
    allowChangeMeta.value =
      parent?.meta === 'conversation' &&
      conversationStore.canMakeMeta(nodeId);
  } else {
    selectedIbisTypes.value = ibis_node_type_list;
    allowChangeMeta.value = false;
  }
  calcPublicationConstraints(selectedNodeLocal);
  editingNodeId.value = nodeId;
  editable.value = true;
  await nextTick();
  const formKey = `editForm_${nodeId}`;
  const formInstance = nodeForms.value[formKey] || null;
  form.value = formInstance;

  if (form.value?.setFocus) {
    form.value.setFocus();
  } else {
    console.warn('Form instance not ready yet for nodeId', nodeId);
  }
}
function findNodeById(
  nodes: Partial<QTreeNode[]> | undefined,
  id: number,
): QTreeNode | null {
  if (!nodes) return null;
  for (const node of nodes) {
    if (node!.id === id) {
      return node as QTreeNode;
    }
    if (node!.children && node!.children.length > 0) {
      const found = findNodeById(node!.children, id);
      if (found) return found;
    }
  }
  return null;
}
function initialize() {
  tree.value = conversationStore.getConversationTree;
  q.value = conversationStore.getChildrenOf(nodeId.value);
}

// Lifecycle Hooks
onBeforeMount(async () => {
  await waitUserLoaded();
  if (typeof route.params.quest_id === 'string')
    questId.value = Number(route.params.quest_id);
  await conversationStore.ensureConversation(questId.value!);
  const rootNode = conversationStore.getRootNode;
  nodeId.value = rootNode?.id;
  initialize();
  ready.value = true;
});
</script>

<style>
.q-item-image {
  min-width: 10px;
  max-width: 10px;
}

.scroll.relative-position.overflow-hidden.fit.q-touch {
  user-select: auto !important;
}
.node-card {
  width: 70%;
}
@media only screen and (max-width: 1300px) {
  .node-card {
    width: 70%;
  }
}
@media only screen and (max-width: 800px) {
  .node-card {
    width: 98%;
  }
}
.description {
  max-height: 50px;
  background-color: gray;
}
.node:hover {
  background-color: rgba(255, 255, 0, 0.801);
}
.content {
  background-color: lightgrey;
  padding: 1em;
  margin-bottom: 1em;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10pt;
  width: 100%;
}
.scrollable-description {
  max-height: 220px;
  overflow-y: auto;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 6px;
  width: 100%;
}
#node-description {
  padding: 1em;
  margin-bottom: 1em;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12pt;
  width: 100%;
}

.content {
  padding: 1em;
  margin-bottom: 1em;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14pt;
  width: 100%;
}
.quest-description-col {
  width: 100%;
}
@media only screen and (max-width: 800px) {
  quest-description-col {
    width: 98%;
  }
}

/** from view.hbs */
/**
* Enable columns to scroll right and left

.columnscroller {
  border: 1px solid black;
  width: 100%;
  white-space: nowrap;
  overflow-x: scroll;
  overflow-y: hidden;
  margin: 5px;
  border-radius: 3px;
}
*/

/**
* width is set to accomodate lots of columns.
* If they wrap when adding more columns, then
* width must increase.
* The formula seems to be column width * num colums + 100px 2500
*/

.icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  height: 80px; /* Fixed height for icon containers */
  width: 80px;
}

.icon {
  width: 20px;
  height: 20px;
}
</style>
