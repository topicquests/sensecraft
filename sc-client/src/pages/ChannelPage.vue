<template>
  <q-page class="bg-grey-1 q-pa-md">
    <!-- Breadcrumb and Role Badge -->
    <div class="row q-mb-md">
      <div class="col-12">
        <q-breadcrumbs class="q-pa-sm rounded-borders shadow-2">
          <q-breadcrumbs-el
            class="text-white"
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
    <q-card class="q-pa-md">
      <q-card-section class="row q-col-gutter-md">
        <!-- Left: Node Tree -->
        <div class="col-12 col-md-9">
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
              <h3 class="text-h6 text-primary text-weight-bold q-mb-sm row items-center selected-node-header">
                <q-icon name="label_important" class="q-mr-sm" />
                Selected Node
              </h3>
              <q-card-section>
                <div class="text-h6 text-primary q-mb-sm">
                  {{ selectedNode.title || 'Selected Node' }}
                </div>
                <div class="text-caption text-grey">
                  Node ID: {{ selectedNode.id }}
                  <q-badge v-if="selectedNode.parent_id === null" color="deep-orange" class="q-ml-xs">
                    Root
                  </q-badge>
                </div>
                <div
                  class="scrollable-description q-mb-md"
                  style="max-height: 200px; overflow-y: auto;"
                >
                  <div
                    v-if="selectedNode.description"
                    v-html="selectedNode.description"
                    class="node-card-details"
                  />
                  <div v-else class="text-grey">
                    No description provided.
                  </div>
                </div>
              </q-card-section>
              <q-separator />
              <EditButton
                :nodeId="selectedNode.id"
                :channelId="channelId"
                :questId="questId"
                @click="editNode(selectedNode.id)"
              />
              <q-btn flat icon="add" />
            </q-card>
          </div>
           <!-- Floating Node Form -->
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
     <div v-if="editable && selectedNodeId == addingChildToNodeId && newNode && Object.keys(newNode).length" class="floating-node-form">
        <node-form
          :ref="nodeFormRef(selectedNodeId)"
          v-if="editable && selectedNodeId== addingChildToNodeId"
          :nodeInput="newNode"
          :allowAddChild="false"
          :ibisTypes="childIbisTypes"
          :editing="true"
          :roles="roleStore.getRoles"
          :allowChangeMeta="allowChangeMeta"
          :pubFn="calcSpecificPubConstraints"
          v-on:action="confirmAddChild"
          v-on:cancel="cancel"
        />
      </div>
        </transition>
        <q-card-section v-if="!ready" class="col-12 row justify-center items-center q-my-lg loading-area">
          <q-spinner color="primary" size="50px" />
          <div class="q-ml-sm text-primary text-weight-semibold">Loading channel and nodes...</div>
        </q-card-section>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount, watch, nextTick, ComponentPublicInstance } from 'vue';
import { useRoute } from 'vue-router';
import nodeTree from '../components/node-tree.vue';
import { useGuildStore } from '../stores/guilds';
import { useChannelStore } from '../stores/channel';
import { useRoleStore } from '../stores/role';
import { ConversationNode } from '../types';
import { useConversationStore } from '../stores/conversation';
import EditButton from '../components/edit-button.vue';
type NodeFormInstance = ComponentPublicInstance<{
  setFocus: () => void;
}>;

// Stores
const guildStore = useGuildStore();
const channelStore = useChannelStore();
const roleStore = useRoleStore();
const conversationStore = useConversationStore();
const route = useRoute();

// Reactive variables
const guildId = ref<number>(Number(route.params.guild_id));
const questId = ref<number | undefined>(
  route.params.quest_id ? Number(route.params.quest_id) : undefined
);
const channelId = ref<number>(Number(route.params.channel_id));
const selectedNodeId = ref<number | undefined>(channelId.value);
const selectedNode = ref<ConversationNode | null>(
  channelStore.getChannelNode(channelId.value, selectedNodeId.value!)
);
const currentChannel = computed(() => channelStore.channels[channelId.value]);
const roles = roleStore.getRoles;
const ready = ref(false);
const editable = ref<boolean>(true)
const newNode = ref<ConversationNode | null>(null);
const addingChildToNodeId = ref<number | null>(null);
const editingNodeId = ref<number | undefined>(undefined);
const allowChangeMeta = ref(false);
const selectedIbisTypes = ref<any[]>([]);
const form = ref<NodeFormInstance | null>(null);
const nodeForms = ref<Record<string, NodeFormInstance | null>>({});

// ---- Placeholder stubs (replace with real ones) ----
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
function ibis_child_types(nodeType: string) {
  return ['childType1', 'childType2'];
}
const ibis_node_type_list = ['type1', 'type2', 'type3'];

  calcPublicationConstraints(selectedNode);
  editingNodeId.value = selectedNodeId;;
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

function getNode(nodeId: number): ConversationNode | null {
  return channelStore.getChannelNode(channelId.value, nodeId) ?? null;
}

// ---- Route watching ----
watch(
  () => route.params.channel_id,
  async (newId, oldId) => {
    if (newId !== oldId) {
      await loadChannelData();
      selectionChanged(Number(newId));
    }
  }
);

watch(
  () => route.params.node_id, // if your route has a node param
  async newNodeId => {
    if (newNodeId) {
      await nextTick();
      await editNode(Number(newNodeId));
    }
  },
  { immediate: true }
);
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

function selectionChanged(newSelectedNodeId: number) {
  selectedNodeId.value = newSelectedNodeId;
  selectedNode.value = channelStore.getChannelNode(channelId.value, newSelectedNodeId);

  const correctChannelId = channelStore.getChannelOfNode(newSelectedNodeId);
  if (correctChannelId) {
    channelId.value = Number(correctChannelId);
  }
}

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
    selectedIbisTypes.value = ibis_child_types(parent?.node_type ?? '');
    allowChangeMeta.value =
      parent?.meta === 'conversation' && conversationStore.canMakeMeta(nodeId);
  } else {
    selectedIbisTypes.value = ibis_node_type_list;
    allowChangeMeta.value = false;
  }

  calcPublicationConstraints(selectedNodeLocal);
  editingNodeId.value = nodeId;

  await nextTick();
  const formKey = `editForm_${nodeId}`;
  form.value = nodeForms.value[formKey];
  form.value?.setFocus?.();
}

onBeforeMount(async () => {
  await loadChannelData();
  ready.value = true;
});
</script>
