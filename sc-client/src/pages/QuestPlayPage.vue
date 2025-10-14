<template>
  <q-page v-if="ready" class="quest-play-page bg-secondary">
    <div class="member-container">
      <member />
    </div>

    <div class="main-container row justify-center q-pa-md">
      <q-card flat bordered class="quest-card">
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

      <div class="content-section row q-mt-sm">
        <div class="col-12 col-md-8">
          <q-card class="content-card">
            <quest-node-tree
              :questId="questId"
              :guildId="guildId"
              :selectedNodeId="selectedNodeId"
            />
          </q-card>
        </div>

        <transition name="fade">
          <div class="col-12 col-md-3" v-if="selectedNode">
            <q-card flat bordered class="selected-node-card q-ml-sm">
              <div class="selected-node-header row items-center">
                <q-icon name="label_important" class="icon-accent" size="24px" />
                <div class="selected-node-title">
                  {{ selectedNode!.title || 'Selected Node' }}
                </div>
              </div>

              <q-card-section class="node-info">
                <div class="text-caption text-grey q-mb-sm">
                  Node ID: {{ selectedNode!.id }}
                  <q-badge v-if="selectedNode!.parent_id === null" color="deep-orange" class="q-ml-xs">
                    Root
                  </q-badge>
                </div>

                <div class="scrollable-description">
                  <div v-if="selectedNode!.description" v-html="selectedNode!.description" />
                  <div v-else class="text-grey">No description provided.</div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-actions align="right">
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
        </transition>
      </div>
    </div>

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
import member from '../components/member-handle.vue';
import questNodeTree from '../components/quest-node-tree.vue';
import questDetails from '../components/quest-details.vue';
import questActions from '../components/quest-actions.vue';
import { waitUserLoaded } from '../app-access';
import { useRoute } from 'vue-router';
import { ref, computed, onMounted, watch, nextTick, ComponentPublicInstance } from 'vue';
import { useQuestStore } from '../stores/quests';
import { useGuildStore } from '../stores/guilds';
import { useMemberStore } from '../stores/member';
import { ConversationNode, GuildData, GuildMembership, QTreeNode } from '../types';
import { useConversationStore } from '../stores/conversation';
import { ibis_child_types } from '../stores/conversation';
import {
  ibis_node_type_list,
  publication_state_enum,
  publication_state_list,
  publication_state_type,
} from '../enums';
import EditButton from '../components/edit-button.vue';
import NodeForm from '../components/node-form.vue';
import { useRoleStore } from '../stores/role';
import { useQuasar } from 'quasar';

type NodeFormInstance = ComponentPublicInstance<{ setFocus: () => void }>;

const questStore = useQuestStore();
const guildStore = useGuildStore();
const memberStore = useMemberStore();
const conversationStore = useConversationStore();
const roleStore = useRoleStore();

const route = useRoute();
const $q = useQuasar();

let myPlayingGuilds: GuildData[] = [];
let baseNodePubStateConstraints: publication_state_type[];
let childIbisTypes = ibis_node_type_list;

const ready = ref(false);
const questId = ref<number | undefined>(undefined);
const mySelectedPlayingGuildId = ref<number | undefined>(undefined);
const newNode = ref({});
const addingChildToNodeId = ref<number | null>(null);
const selectedIbisTypes = ref<any[]>([]);
const allowChangeMeta = ref(false);
const editingNodeId = ref<number | null>(null);
const form = ref<NodeFormInstance | null>(null);
const editable = ref(true);
const nodesTree = ref<QTreeNode[]>([]);
const showFocusNeighbourhood = ref(false);
const nodeForms = ref<Record<string, NodeFormInstance | null>>({});

const parseNodeId = (param: string | string[] | undefined): number | undefined =>
  typeof param === 'string' ? Number.parseInt(param) : Array.isArray(param) ? Number.parseInt(param[0]) : undefined;

const selectedNodeId = ref<number | undefined>(parseNodeId(route.params.node_id));

const selectedNode = computed(() =>
  selectedNodeId.value != null ? conversationStore.getConversationNodeById(selectedNodeId.value) : undefined,
);
const guildId = computed(() => {
  const quest_id = questStore.getCurrentQuest?.id;
  const casting = memberStore.castingPerQuest[quest_id!];
  return casting ? casting.guild_id : undefined;
});
const currentGuildId = computed(() => guildStore.getCurrentGuild);
const canAddChild = computed(() => () => canAddTo() && !editingNodeId.value && !addingChildToNodeId.value);

watch(guildId, async () => await initializeGuildInner());
watch(questId, async () => await initialize());
watch(() => route.params.node_id, (v) => (selectedNodeId.value = parseNodeId(v)));

onMounted(async () => {
  ready.value = false;
  await initialize();
  ready.value = true;
});

function nodeFormRef(nodeId: string | number) {
  return (el: Element | NodeFormInstance | null) => {
    if (el && typeof el === 'object' && '$' in el) nodeForms.value[`editForm_${nodeId}`] = el;
    else nodeForms.value[`editForm_${nodeId}`] = null;
    if (editingNodeId.value === nodeId) form.value = nodeForms.value[`editForm_${nodeId}`];
  };
}

function canAddTo(): boolean {
  const quest = questStore.getQuestById(questId.value!);
  return quest ? (quest.is_playing || quest.is_quest_member) && quest.status != 'finished' : false;
}

function addChildToNode(nodeId: number | null) {
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
  setTimeout(() => form.value?.setFocus(), 0);
}

async function confirmAddChild(node: ConversationNode) {
  try {
    await conversationStore.createConversationNode(node);
    cancel();
    nodesTree.value = getNodesTree() ?? [];
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to add node. Please try again.' });
  }
}

const getNodesTree = (): QTreeNode[] =>
  showFocusNeighbourhood.value
    ? conversationStore.getNeighbourhoodTree ?? []
    : currentGuildId.value
    ? conversationStore.getPrivateConversationTree ?? []
    : conversationStore.getConversationTree ?? [];

function calcPublicationConstraints(node: Partial<ConversationNode>) {
  if (!currentGuildId.value) {
    baseNodePubStateConstraints = [publication_state_enum.private_draft, publication_state_enum.published];
    return;
  }
  const pub_states = [...publication_state_list];
  if (!node) return [];
  if (node.parent_id) {
    const parent = getNode(node.parent_id);
    if (parent) {
      const pos = pub_states.indexOf(parent.status);
      if (pos >= 0) pub_states.splice(pos + 1);
    }
  }
  if (node.id) {
    const children_status = conversationStore.getChildrenOf(node.id)!.map((n) => n!.status);
    if (children_status.length > 0) {
      children_status.sort(
        (a, b) => publication_state_list.indexOf(a) - publication_state_list.indexOf(b),
      );
      const pos = pub_states.indexOf(children_status[0]);
      if (pos > 0) pub_states.splice(0, pos);
    }
  }
  if (node.meta == 'channel') {
    const pos = pub_states.indexOf('proposed');
    if (pos >= 0) pub_states.splice(pos);
  }
  baseNodePubStateConstraints = pub_states;
}

function calcSpecificPubConstraints(node: Partial<ConversationNode>) {
  if (node.meta == 'channel' || !currentGuildId.value) return baseNodePubStateConstraints;
  const pub_states = [...baseNodePubStateConstraints];
  if (node.meta == 'meta') {
    const pos = pub_states.indexOf('proposed');
    if (pos >= 0) pub_states.splice(pos);
  }
  const node_type = node.node_type;
  if (node_type && node.quest_id) {
    const max_state = questStore.getMaxPubStateForNodeType(node.quest_id, node_type);
    const pos = pub_states.indexOf(max_state);
    if (pos >= 0) pub_states.splice(pos + 1);
  }
  if (!pub_states.includes(node.status!)) pub_states.push(node.status!);
  return pub_states;
}

function cancel() {
  editingNodeId.value = null;
  addingChildToNodeId.value = null;
  newNode.value = {};
}

async function confirmEdit(node: Partial<ConversationNode>) {
  try {
    await conversationStore.updateConversationNode(node);
    cancel();
    $q.notify({ message: `Node updated`, color: 'positive' });
  } catch {
    $q.notify({ message: `There was an error updating node.`, color: 'negative' });
  }
}

function guildsPlayingGame(onlyMine = false, recruiting = false) {
  let guildIds = questStore.getCurrentQuest?.game_play?.map((gp) => gp.guild_id) || [];
  if (onlyMine)
    guildIds = guildIds.filter((g) =>
      memberStore.member?.guild_membership?.some((gm: GuildMembership) => gm.guild_id === g && gm.status === 'confirmed'),
    );
  let guilds = guildIds.map((gid) => guildStore.getGuildById(gid));
  if (recruiting) guilds = guilds.filter((g) => g.open_for_applications);
  return guilds;
}

function getNode(nodeId: number): ConversationNode | null {
  return conversationStore.getConversationNodeById(nodeId) ?? null;
}

async function editNode(nodeId: number) {
  const selectedNodeLocal = getNode(nodeId);
  if (!selectedNodeLocal) return;
  newNode.value = { ...selectedNodeLocal };
  addingChildToNodeId.value = null;
  if (selectedNodeLocal.parent_id != null) {
    const parent = getNode(selectedNodeLocal.parent_id);
    selectedIbisTypes.value = parent?.node_type ? ibis_child_types(parent.node_type) : [];
    allowChangeMeta.value = parent?.meta === 'conversation' && conversationStore.canMakeMeta(nodeId);
  } else {
    selectedIbisTypes.value = ibis_node_type_list;
    allowChangeMeta.value = false;
  }
  calcPublicationConstraints(selectedNodeLocal);
  editingNodeId.value = nodeId;
  editable.value = true;
  await nextTick();
  const formKey = `editForm_${nodeId}`;
  form.value = nodeForms.value[formKey] || null;
  form.value?.setFocus?.();
}

async function initialize() {
  await waitUserLoaded();
  if (typeof route.params.quest_id === 'string') questId.value = Number.parseInt(route.params.quest_id);
  questStore.setCurrentQuest(questId.value);
  await Promise.all([
    questStore.ensureQuest({ quest_id: questId.value! }),
    guildStore.ensureGuildsPlayingQuest({ quest_id: questId.value! }),
    roleStore.ensureAllRoles(),
  ]);
  await initializeGuildInner();
}

async function initializeGuildInner() {
  if (guildId.value) {
    ready.value = false;
    guildStore.setCurrentGuild(guildId.value);
    await guildStore.ensureGuild(guildId.value);
    if (!selectedNodeId.value) selectedNodeId.value = questStore.getCurrentGamePlay?.focus_node_id;
    ready.value = true;
  } else if (memberStore.member) {
    myPlayingGuilds = guildsPlayingGame(true);
    if (myPlayingGuilds.length) mySelectedPlayingGuildId.value = myPlayingGuilds[0].id;
  }
}
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

.main-container {
  max-width: 100%;
  margin: 0 auto;
  width: 100%;
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

.content-section > .col-12 {
    padding-left: 0;
    padding-right: 0;
}

@media (max-width: 768px) {
  .content-section {
    margin-left: 0;
    margin-right: 0;
    width: 100%;
  }
}

.content-card {
  height: 100%;
  padding: 1rem;
}

.selected-node-card {
  height: 500px;
  max-height: 550px;
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
  .floating-node-form {
    width: 90%;
    top: 40px;
    max-height: 90vh;
  }
}
</style>
