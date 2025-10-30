<template>
  <q-page v-if="ready" class="quest-play-page bg-secondary">
    <!-- Member handle -->
    <div class="member-container">
      <member />
    </div>

    <!-- Quest header and actions -->
    <q-card flat bordered class="quest-card q-mb-md">
      <section class="q-mb-md">
        <quest-details />
      </section>
      <q-separator spaced />
      <section class="q-mt-md">
        <quest-actions :myPlayingGuilds="myPlayingGuilds" :questId="questId" />
      </section>
      <q-separator spaced />
      <div class="center-button">
        <q-btn
          color="accent"
          unelevated
          size="lg"
          icon="view_module"
          label="Card View"
          :to="{ name: 'conversation_column', params: { quest_id: questId } }"
          class="card-view-btn"
        />
      </div>
    </q-card>
    <div class="content-section-wrapper">
      <div class="content-section row q-pa-sm">
        <div class="col-12 col-md-8 tree-container">
          <q-card class="content-card">
            <quest-node-tree
              :questId="questId"
              :guildId="guildId"
              v-model:selectedNodeId="selectedNodeId"
            />
          </q-card>
        </div>
        <transition name="fade">
          <div
            v-if="$q.screen.gt.xs"
            class="col-12 col-md-4 selected-card-wrapper"
          >
            <q-card v-show="selectedNode" flat bordered class="selected-node-card">
              <div class="selected-node-header row items-center">
                <q-icon name="label_important" class="icon-accent" size="24px" />
                <div class="selected-node-title">{{ selectedNode?.title || 'Selected Node' }}</div>
              </div>

              <q-card-section class="node-info">
                <div class="text-caption text-grey q-mb-sm">
                  Node ID: {{ selectedNode?.id }}
                  <q-badge
                    v-if="selectedNode?.parent_id === null"
                    color="deep-orange"
                    class="q-ml-xs"
                  >
                    Root
                  </q-badge>
                </div>

                <div class="scrollable-description">
                  <div v-if="selectedNode?.description" v-html="selectedNode.description" />
                  <div v-else class="text-grey">No description provided.</div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-actions align="right">
                <EditButton
                  v-if="selectedNode"
                  :nodeId="selectedNode.id"
                  :questId="questId"
                  class="q-mr-sm"
                  @click="editNode(selectedNode.id)"
                />
                <q-btn
                  v-if="selectedNode && canAddChild()"
                  flat
                  color="primary"
                  icon="add"
                  label="Add Child"
                  @click="addChildToNode(selectedNode.id)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </transition>
      </div>
    </div>

    <!-- Floating Node Forms -->
     <div v-if="editable && selectedNodeId === editingNodeId && selectedNode" class="floating-node-form">
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
    </div>

  <div
      v-if="editable && selectedNodeId == addingChildToNodeId && newNode && Object.keys(newNode).length"
      class="floating-node-form"
    >
      <node-form
        :ref="nodeFormRef(selectedNodeId)"
        :nodeInput="newNode"
        :allowAddChild="false"
        :ibisTypes="childIbisTypes"
        :editing="true"
        :roles="roleStore.getRoles"
        :allowChangeMeta="allowChangeMeta"
        :pubFn="calcSpecificPubConstraints"
        @action="confirmAddChild"
        @cancel="cancel"
      />
    </div>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, ComponentPublicInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

import member from '../components/member-handle.vue';
import questNodeTree from '../components/quest-node-tree.vue';
import questDetails from '../components/quest-details.vue';
import questActions from '../components/quest-actions.vue';
import EditButton from '../components/edit-button.vue';
import NodeForm from '../components/node-form.vue';

import { useQuestStore } from '../stores/quests';
import { useGuildStore } from '../stores/guilds';
import { useMemberStore } from '../stores/member';
import { useConversationStore } from '../stores/conversation';
import { useRoleStore } from '../stores/role';
import { waitUserLoaded } from '../app-access';

import { ConversationNode } from '../types';
import { ibis_node_type_list, ibis_node_type_type, publication_state_enum, publication_state_list, publication_state_type } from '../enums';
import { ibis_child_types } from '../stores/conversation';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const questStore = useQuestStore();
const guildStore = useGuildStore();
const memberStore = useMemberStore();
const conversationStore = useConversationStore();
const roleStore = useRoleStore();

const ready = ref(false);
const questId = ref<number | undefined>();
const myPlayingGuilds = ref([]);
const selectedIbisTypes = ref<ibis_node_type_type[]>([]);
const childIbisTypes = ref<ibis_node_type_type[]>([...ibis_node_type_list]);
const editable = ref(true);
const editingNodeId = ref<number | null>(null);
const addingChildToNodeId = ref<number | null>(null);
const newNode = ref<Partial<ConversationNode>>({});
const allowChangeMeta = ref(false);
const nodeForms = ref<Record<string, ComponentPublicInstance<{ setFocus: () => void }> | null>>({});
const form = ref<ComponentPublicInstance<{ setFocus: () => void }> | null>(null);
let baseNodePubStateConstraints: publication_state_type[] = [];

const selectedNodeId = ref<number | undefined>(
  typeof route.params.node_id === 'string' ? parseInt(route.params.node_id) : undefined
);

const selectedNode = computed(() =>
  selectedNodeId.value != null ? conversationStore.getConversationNodeById(selectedNodeId.value) : undefined
);

const guildId = computed(() => {
  const quest_id = questStore.getCurrentQuest?.id;
  const casting = memberStore.castingPerQuest[quest_id!];
  return casting ? casting.guild_id : undefined;
});

const currentGuildId = computed(() => guildStore.getCurrentGuild);

const canAddChild = computed(() => () => currentGuildId.value && !editingNodeId.value && !addingChildToNodeId.value);
watch(
  () => route.params.node_id,
  (newId) => {
    selectedNodeId.value = newId ? parseInt(newId as string) : undefined;
  }
);

// Only scroll on desktop
watch(selectedNodeId, async () => {
  if (editingNodeId.value !== selectedNodeId.value) editingNodeId.value = null;
  if (addingChildToNodeId.value !== selectedNodeId.value) addingChildToNodeId.value = null;

  await nextTick();
  if ($q.screen.gt.xs) {
    const el = document.querySelector('.selected-node-card');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    form.value?.setFocus?.();
  }
});

// --- Node Form Ref ---
function nodeFormRef(nodeId: string | number) {
  return (el: Element | ComponentPublicInstance<{ setFocus: () => void }> | null) => {
    if (el && typeof el === 'object' && '$' in el) nodeForms.value[`editForm_${nodeId}`] = el;
    else nodeForms.value[`editForm_${nodeId}`] = null;
    if (editingNodeId.value === nodeId) form.value = nodeForms.value[`editForm_${nodeId}`];
  };
}

// --- Node Operations ---
function getNode(nodeId: number): ConversationNode | null {
  return conversationStore.getConversationNodeById(nodeId) ?? null;
}

function addChildToNode(nodeId: number | null) {
  const parent = getNode(nodeId!);
  if (!parent) return;
  childIbisTypes.value = ibis_child_types(parent.node_type);
  allowChangeMeta.value = parent.meta === 'conversation';

  newNode.value = {
    status: 'private_draft',
    node_type: childIbisTypes.value[0],
    parent_id: nodeId!,
    quest_id: parent.quest_id,
    guild_id: guildStore.getCurrentGuild!.id,
    meta: parent.meta,
  };
  calcPublicationConstraints(newNode.value);
  addingChildToNodeId.value = nodeId;

  if ($q.screen.gt.xs) setTimeout(() => form.value?.setFocus(), 0);
}

async function confirmAddChild(node: ConversationNode) {
  try {
    await conversationStore.createConversationNode(node);
    cancel();
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to add node. Please try again.' });
  }
}

async function editNode(nodeId: number) {
  const node = getNode(nodeId);
  if (!node) return;

  newNode.value = { ...node };
  addingChildToNodeId.value = null;

  if (node.parent_id != null) {
    const parent = getNode(node.parent_id);
    selectedIbisTypes.value = parent?.node_type ? ibis_child_types(parent.node_type) : [];
    allowChangeMeta.value = parent?.meta === 'conversation' && conversationStore.canMakeMeta(nodeId);
  } else {
    selectedIbisTypes.value = [...ibis_node_type_list];
    allowChangeMeta.value = false;
  }

  calcPublicationConstraints(node);
  editingNodeId.value = nodeId;
  editable.value = true;

  if ($q.screen.gt.xs) await nextTick(), form.value?.setFocus();
}

async function confirmEdit(node: Partial<ConversationNode>) {
  try {
    await conversationStore.updateConversationNode(node);
    cancel();
    $q.notify({ message: 'Node updated', color: 'positive' });
  } catch {
    $q.notify({ message: 'There was an error updating node.', color: 'negative' });
  }
}

function cancel() {
  editingNodeId.value = null;
  addingChildToNodeId.value = null;
  newNode.value = {};
}

// --- Publication Constraints ---
function calcPublicationConstraints(node: Partial<ConversationNode>) {
  if (!currentGuildId.value) {
    baseNodePubStateConstraints = [publication_state_enum.private_draft, publication_state_enum.published];
    return;
  }

  const pub_states = [...publication_state_list];

  if (node.parent_id) {
    const parent = getNode(node.parent_id);
    if (parent) {
      const pos = pub_states.indexOf(parent.status);
      if (pos >= 0) pub_states.splice(pos + 1);
    }
  }

  if (node.id) {
    const children_status = conversationStore.getChildrenOf(node.id)?.map(n => n!.status) || [];
    if (children_status.length > 0) {
      children_status.sort(
        (a, b) => publication_state_list.indexOf(a) - publication_state_list.indexOf(b)
      );
      const pos = pub_states.indexOf(children_status[0]);
      if (pos > 0) pub_states.splice(0, pos);
    }
  }

  if (node.meta === 'channel') {
    const pos = pub_states.indexOf('proposed');
    if (pos >= 0) pub_states.splice(pos);
  }

  baseNodePubStateConstraints = pub_states;
}

const calcSpecificPubConstraints = (node: Partial<ConversationNode>): publication_state_type[] => {
  if (!node) return [];
  if (node.meta === 'channel' || !currentGuildId.value) return baseNodePubStateConstraints;

  const pub_states = [...baseNodePubStateConstraints];

  if (node.meta === 'meta') {
    const pos = pub_states.indexOf('proposed');
    if (pos >= 0) pub_states.splice(pos, 1);
  }

  if (node.node_type && node.quest_id) {
    const max_state = questStore.getMaxPubStateForNodeType(node.quest_id, node.node_type);
    const pos = pub_states.indexOf(max_state);
    if (pos >= 0) pub_states.splice(pos + 1);
  }

  if (node.status && !pub_states.includes(node.status)) pub_states.push(node.status);

  return pub_states;
};

// --- Initialization ---
async function initialize() {
  await waitUserLoaded();

  if (typeof route.params.quest_id === 'string') questId.value = parseInt(route.params.quest_id);
  questStore.setCurrentQuest(questId.value);

  await Promise.all([
    questStore.ensureQuest({ quest_id: questId.value! }),
    guildStore.ensureGuildsPlayingQuest({ quest_id: questId.value! }),
    roleStore.ensureAllRoles()
  ]);

  if (guildId.value) {
    guildStore.setCurrentGuild(guildId.value);
    await guildStore.ensureGuild(guildId.value);

    if (!selectedNodeId.value) selectedNodeId.value = questStore.getCurrentGamePlay?.focus_node_id;
  } else if (memberStore.member) {
    myPlayingGuilds.value = guildStore.getGuilds.filter(g => g.open_for_applications);
  }

  ready.value = true;
}

onMounted(async () => {
  ready.value = false;
  await initialize();
  ready.value = true;
});
</script>

<style scoped>
.quest-play-page {
  background: url('../statics/images/questBackgroundImage.jpg') no-repeat center center fixed;
  background-size: cover;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
}

.member-container {
  display: flex;
  justify-content: flex-end;
  margin-left: 1rem;
}

.quest-card {
  width: 100%;
  background-color: transparent;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 1.5rem;
}

.center-button {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.content-section-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  height: calc(100vh - 250px);
  overflow: hidden;
}

.content-section {
  display: flex;
  flex: 1;
  gap: 16px;
  height: 100%;
  overflow-y: auto;
}

.tree-container {
  flex: 2;
  overflow-y: auto;
}

.selected-card-wrapper {
  flex: 1;
  position: relative;
}

.selected-node-card {
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.selected-node-header {
  background: linear-gradient(90deg, #f5f7fa, #e3eaf2);
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 0.5rem 1rem;
}

.icon-accent {
  margin-right: 0.5rem;
  color: var(--q-accent);
}

.selected-node-title {
  color: var(--q-primary);
  font-weight: 600;
}

.node-info {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.scrollable-description {
  width: 90%;
  height: 220px;
  max-height: 320px;
  overflow-y: auto;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.card-view-btn {
  border-radius: 30px;
  font-weight: bold;
  letter-spacing: 0.5px;
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.6);
  transition: transform 0.2s ease, box-shadow 0.3s ease;
}

.card-view-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.8);
}

.floating-node-form {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: transparent;
  overflow: hidden;
}

.floating-node-form > * {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 768px) {
  .content-section-wrapper {
    flex-direction: column;
    height: auto;
  }
  .tree-container,
  .selected-card-wrapper {
    width: 100%;
  }
  .floating-node-form {
    width: 90%;
    top: 40px;
    max-height: 90vh;
  }
}
</style>
