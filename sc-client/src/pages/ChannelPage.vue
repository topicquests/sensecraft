<template>
  <q-page class="bg-grey-1 q-pa-md">
    <!-- Breadcrumbs -->
    <div class="row q-mb-md">
      <div class="col-12">
        <q-breadcrumbs class="q-pa-sm rounded-borders shadowed-breadcrumbs">
          <q-breadcrumbs-el
            class="text-black"
            icon="home"
            label="Guild"
            :to="{ name: 'guild', params: { guild_id: guildId } }"
          />
          <q-breadcrumbs-el
            v-if="questId"
            icon="flag"
            label="Quest"
            :to="{ name: 'quest_page', params: { guild_id: guildId } }"
          />
          <q-breadcrumbs-el icon="forum" label="Channel" />
        </q-breadcrumbs>
      </div>
    </div>

    <!-- Channel Title -->
    <div class="text-h5 q-mb-md channel-title">
      {{ currentChannel?.title || 'Channel Name' }}
    </div>

    <!-- Main Card Layout -->
    <q-card class="q-pa-md main-card">
      <q-card-section class="row q-col-gutter-md">
        <!-- Left: Node Tree -->
        <div class="col-12 col-md-9 node-tree-wrapper">
          <div class="text-subtitle2 q-mb-sm tree-header">Channel Discussion Tree</div>
          <node-tree
            :initialSelectedNodeId="selectedNodeId"
            @tree-selection="selectionChanged"
            :currentGuildId="guildId"
            :currentQuestId="questId"
            :channelId="channelId"
            :isChannel="true"
            :roles="roles"
            :editable="true"
            :nodeForms="nodeForms"
          />
        </div>

        <!-- Right: Selected Node -->
        <transition name="fade">
          <div class="col-12 col-md-3" v-if="selectedNode">
            <q-card flat bordered class="q-pa-md shadow-2 rounded-borders selected-node-card">
              <div class="selected-node-header row items-center q-mb-sm">
                <q-icon name="label_important" class="q-mr-sm text-primary" />
                <span class="text-h6 text-primary text-weight-bold">Selected Node</span>
              </div>

              <q-card-section>
                <div class="text-h6 text-primary q-mb-sm">
                  {{ selectedNode.title || 'Selected Node' }}
                </div>
                <div class="text-caption text-grey mb-2">
                  Node ID: {{ selectedNode.id }}
                  <q-chip v-if="selectedNode.parent_id === null" color="deep-orange" class="q-ml-xs">
                    Root
                  </q-chip>
                </div>
                <div class="scrollable-description">
                  <div
                    v-if="selectedNode.description"
                    v-html="selectedNode.description"
                    class="node-card-details"
                  />
                  <div v-else class="text-grey">No description provided.</div>
                </div>
              </q-card-section>

              <q-separator />
              <div class="node-card-actions row items-center justify-between q-mt-sm">
                <EditButton
                  :nodeId="selectedNode.id"
                  :channelId="channelId"
                  :questId="questId"
                  @click="editNode(selectedNodeId!)"
                />
                <q-btn
                  v-if="canAddChild()"
                  flat
                  icon="add"
                  color="primary"
                  @click="addChildToNode(selectedNodeId!)"
                />
              </div>
            </q-card>
          </div>
        </transition>

        <!-- Loading -->
        <q-card-section
          v-if="!ready"
          class="col-12 row justify-center items-center q-my-lg loading-area"
        >
          <q-spinner color="primary" size="50px" />
          <div class="q-ml-sm text-primary text-weight-semibold">
            Loading channel and nodes...
          </div>
        </q-card-section>
      </q-card-section>
    </q-card>

    <!-- Floating Node Form for Editing -->
    <div
      v-if="editable && selectedNodeId === editingNodeId && selectedNode"
      class="floating-node-form"
    >
      <q-btn dense flat round icon="close" class="floating-close-btn" @click="cancel" />
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

    <!-- Floating Node Form for Adding Child -->
    <div
      v-if="editable && selectedNodeId == addingChildToNodeId && newNode && Object.keys(newNode).length"
      class="floating-node-form"
    >
      <q-btn dense flat round icon="close" class="floating-close-btn" @click="cancel" />
      <node-form
        :ref="nodeFormRef(selectedNodeId!)"
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
import { ref, computed, onBeforeMount, watch, nextTick, ComponentPublicInstance } from 'vue';
import { useRoute } from 'vue-router';
import nodeTree from '../components/node-tree.vue';
import { useGuildStore } from '../stores/guilds';
import { useChannelStore } from '../stores/channel';
import { useRoleStore } from '../stores/role';
import { ConversationNode, defaultNodeType, QTreeNode } from '../types';
import { ibis_child_types, useConversationStore } from '../stores/conversation';
import EditButton from '../components/edit-button.vue';
import { ibis_node_type_list, ibis_node_type_type, publication_state_enum, publication_state_list, publication_state_type } from '../enums';
import { useQuestStore } from '../stores/quests';
import { useQuasar } from 'quasar';
import NodeForm from '../components/node-form.vue';

type NodeFormInstance = ComponentPublicInstance<{
  setFocus: () => void;
}>;

// Emits
const emit = defineEmits<{
  'tree-selection': [id: number];
}>();

// Quasar
const $q = useQuasar();

// Stores
const guildStore = useGuildStore();
const channelStore = useChannelStore();
const roleStore = useRoleStore();
const conversationStore = useConversationStore();
const questStore = useQuestStore();
const route = useRoute();

// Reactive variables
const guildId = ref<number>(Number(route.params.guild_id));
const questId = ref<number | undefined>(Number(route.params.quest_id));
const channelId = ref<number>(Number(route.params.channel_id));
const selectedNodeId = ref<number | undefined>(channelId.value);
const selectedNode = ref<Partial<ConversationNode> | null>(
  channelStore.getChannelNode(channelId.value, selectedNodeId.value!)
);
const roles = roleStore.getRoles;
const ready = ref(false);
const editable = ref<boolean>(true)
const newNode = ref<Partial<ConversationNode> | null >(null);
const addingChildToNodeId = ref<number | null>(null);
const editingNodeId = ref<number | undefined>(undefined);
const allowChangeMeta = ref(false);
const showFocusNeighbourhood = ref(false);
const form = ref<NodeFormInstance | null>(null);
const nodeForms = ref<Record<string, NodeFormInstance | null>>({});
const selected = ref<number | null>(null);

//Non reactive variables
let baseNodePubStateConstraints: publication_state_type[];
let selectedIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
let childIbisTypes: ibis_node_type_type[] = ibis_node_type_list;

//computed properties
const currentChannel = computed(() => channelStore.channels[channelId.value]);
const currentGuild = computed(() => guildStore.getCurrentGuild)
const getNodesTree = (): QTreeNode[] => {
  if (channelId.value) {
    return channelStore.getChannelConversationTree(channelId.value) ?? [];
  }
  if (showFocusNeighbourhood.value) {
    return conversationStore.getNeighbourhoodTree ?? [];
  }
  if (currentGuild.value) {
    return conversationStore.getPrivateConversationTree ?? [];
  }
  return conversationStore.getConversationTree ?? [];
};
const canAddChild = computed(() => {
  return () => {
    return (
      editable.value &&
      canAddTo() &&
      !editingNodeId.value &&
      !addingChildToNodeId.value
    );
  };
});
watch(selected, (newVal) => {
  if (newVal !== null && typeof newVal === 'number') {
    emit('tree-selection', newVal);
  }
});
watch(
  () => route.params.channel_id,
   (newId, oldId) => {
    if (newId !== oldId) {
      selectionChanged(Number(newId));
    }
  }
);
watch(
  () => route.params.node_id,
  async newNodeId => {
    if (newNodeId) {
      await nextTick();
      await editNode(Number(newNodeId));
    }
  },
  { immediate: true }
);
// Hooks
onBeforeMount(async () => {
  await loadChannelData();
  ready.value = true;
});

//Functions
async function loadChannelData() {
  await Promise.all([
    guildStore.ensureGuild(guildId.value),
    roleStore.ensureAllRoles(),
    channelStore.ensureChannelConversation(channelId.value, guildId.value),
  ]);
  const channel = channelStore.channels[channelId.value];
  if (channel && channel.children && Object.keys(channel.children).length > 0) {
    const rootNode = Object.values(channel.children).find((n: any) => n.parent_id === null);
    selectedNodeId.value = rootNode?.id ?? undefined;
  } else {
    selectedNodeId.value = channel.id;
    selectedNode.value = channelStore.getChannelNode(channelId.value, selectedNodeId.value);
  }
}
async function confirmEdit(node: Partial<ConversationNode>) {
  try {
    if (channelId.value) {
      await channelStore.updateChannelNode(node);
    } else {
      await conversationStore.updateConversationNode(node);
    }
    cancel();
    nodeTree.value = getNodesTree() ?? [];
    editingNodeId.value = undefined;
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
async function confirmAddChild(node: ConversationNode) {
  try {
    if (channelId.value) {
      await channelStore.createChannelNode(node);
    } else {
      await conversationStore.createConversationNode(node);
    }
    cancel();
    nodeTree.value = getNodesTree() ?? [];
  } catch (error) {
    console.error('Error adding child node:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to add node. Please try again.',
    });
  }
}
function cancel() {
  editingNodeId.value = undefined;
  addingChildToNodeId.value = null;
  newNode.value = {};
}
function calcSpecificPubConstraints(
  node: Partial<ConversationNode> | defaultNodeType
): publication_state_type[] {
  if (node.meta == 'channel' || !currentGuild.value)
    return baseNodePubStateConstraints;

  const pub_states = [...baseNodePubStateConstraints];

  if (node.meta == 'meta') {
    const pos = pub_states.indexOf('proposed');
    if (pos >= 0) pub_states.splice(pos);
  }

  const node_type = (node as ConversationNode).node_type;
  if (node_type && (node as ConversationNode).quest_id) {
    const max_state = questStore.getMaxPubStateForNodeType(
      (node as ConversationNode).quest_id,
      node_type,
    );
    const pos = pub_states.indexOf(max_state);
    if (pos >= 0) pub_states.splice(pos + 1);
  }

  const status = (node as ConversationNode).status;
  if (status && pub_states.indexOf(status) < 0) {
    console.error('current node status not in pub_states');
    pub_states.push(status);
  }

  return pub_states;
}

function calcPublicationConstraints(
  node: Partial<ConversationNode> | defaultNodeType
): publication_state_type[] {
  if (!guildId.value) {
    baseNodePubStateConstraints = [
      publication_state_enum.private_draft,
      publication_state_enum.published,
    ];
    return baseNodePubStateConstraints;
  }

  const pub_states = [...publication_state_list];
  if (!node) return [];

  if ((node as ConversationNode).parent_id) {
    const parent = getNode((node as ConversationNode).parent_id!);
    if (parent) {
      const pos = pub_states.indexOf(parent.status);
      if (pos >= 0) {
        pub_states.splice(pos + 1);
      }
    }
  }

  if ((node as ConversationNode).id) {
    const children_status = conversationStore
      .getChildrenOf((node as ConversationNode).id)!
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
    const pos = pub_states.indexOf('proposed');
    if (pos >= 0) pub_states.splice(pos);
  }

  baseNodePubStateConstraints = pub_states;
  return pub_states;
}

function getNode(nodeId: number): ConversationNode | null {
  return channelStore.getChannelNode(channelId.value, nodeId) ?? null;
}
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
function addChildToNode(nodeId: number | null) {
  const formKey = `addChildForm_${nodeId}`;
  editingNodeId.value = undefined;
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
function canAddTo(): boolean {
  const quest = questStore.getQuestById(
    questId.value!
  );
  if (quest) {
    return (
      (quest.is_playing || quest.is_quest_member) && quest.status != 'finished'
    );
  } else if (channelId.value) {
    return !!guildStore.isGuildMember(guildId.value);
  }
  return false;
}
function selectionChanged(newSelectedNodeId: number) {
  selectedNodeId.value = newSelectedNodeId;
  selectedNode.value = channelStore.getChannelNode(channelId.value, newSelectedNodeId);

  const correctChannelId = channelStore.getChannelOfNode(newSelectedNodeId);
  if (correctChannelId) {
    channelId.value = Number(correctChannelId);
  }
}
async function editNode(nodeId: number) {
  const selectedNodeLocal = getNode(nodeId);
  if (!selectedNodeLocal) {
    console.warn('Node not found:', nodeId);
    return;
  }
  newNode.value = { ...selectedNodeLocal };
  addingChildToNodeId.value = null;
  if (selectedNodeLocal.parent_id != null) {
    const parent = getNode(selectedNodeLocal.parent_id);
    selectedIbisTypes = ibis_child_types(parent!.node_type);
    allowChangeMeta.value =
      parent?.meta === 'conversation' && conversationStore.canMakeMeta(nodeId);
  } else {
    selectedIbisTypes = ibis_node_type_list;
    allowChangeMeta.value = false;
  }
  calcPublicationConstraints(selectedNodeLocal);
  editingNodeId.value = nodeId;
  await nextTick();
  const formKey = `editForm_${nodeId}`;
  form.value = nodeForms.value[formKey];
  form.value?.setFocus?.();
}
</script>
<style scoped>
/* Breadcrumbs */
.shadowed-breadcrumbs {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.shadowed-breadcrumbs .q-breadcrumbs-el:hover {
  cursor: pointer;
  text-decoration: underline;
}

/* Node Tree Wrapper */
.node-tree-wrapper {
  max-height: 70vh;
  overflow-y: auto;
  border-right: 1px solid #e0e0e0;
  padding-right: 16px;
}

/* Selected Node Card */
.selected-node-card {
  background-color: #fafafa;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  padding: 16px;
}
.selected-node-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}
.selected-node-header {
  font-size: 1rem;
}

/* Node Card Details */
.node-card-details {
  font-size: 0.95rem;
  line-height: 1.5;
  max-height: 200px;
  overflow-y: auto;
}

/* Loading Area */
.loading-area {
  min-height: 200px;
  text-align: center;
}

/* Floating Node Form */
.floating-node-form {
  position: fixed;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
  width: 420px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1000;
  background-color: #fdfdfd;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  padding: 24px;
  transition: all 0.3s ease;
}

/* Close Button on Floating Form */
.floating-close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #999;
}
.floating-close-btn:hover {
  color: #ff5252;
}

/* Tree Header */
.tree-header {
  font-weight: 500;
  color: #333;
}

/* Node Card Actions */
.node-card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
</style>
