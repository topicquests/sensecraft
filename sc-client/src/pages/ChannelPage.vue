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

              <q-btn
                :flat="true"
                icon="add"
              />
            </q-card>
          </div>
        </transition>

        <!-- Loading State -->
        <q-card-section v-if="!ready" class="col-12 row justify-center items-center q-my-lg loading-area">
          <q-spinner color="primary" size="50px" />
          <div class="q-ml-sm text-primary text-weight-semibold">Loading channel and nodes...</div>
        </q-card-section>
      </q-card-section>
    </q-card>
  </q-page>
</template>


<script setup lang="ts">
import { ref, computed, onBeforeMount, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import nodeTree from '../components/node-tree.vue';
import { useGuildStore } from '../stores/guilds';
import { useChannelStore } from '../stores/channel';
import { useRoleStore } from '../stores/role';
import { ConversationNode } from '../types';
import { useConversationStore } from '../stores/conversation';
import EditButton from '../components/edit-button.vue';

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
const currentChannel = computed(() => {
  return channelStore.channels[channelId.value];
});
const roles = roleStore.getRoles;
const ready = ref(false);

// -- Variables needed for editNode function --
const newNode = ref<ConversationNode | null>(null);
const addingChildToNodeId = ref<number | null>(null);
const editingNodeId = ref<number | null>(null);
const allowChangeMeta = ref(false);
const selectedIbisTypes = ref<any[]>([]); // adjust type if you have one
const form = ref<any>(null);
const nodeForms = ref<Record<string, any>>({});

// Stub or import ibis_child_types and ibis_node_type_list here
// Example placeholders (replace with your real imports)
function ibis_child_types(nodeType: string) {
  // Return array of valid child types for the given nodeType
  return ['childType1', 'childType2'];
}
const ibis_node_type_list = ['type1', 'type2', 'type3'];

// Stub or import calcPublicationConstraints function
function calcPublicationConstraints(node: ConversationNode) {
  // Your logic here
  // Possibly set some reactive state or perform validation
  console.log('calcPublicationConstraints called for node:', node.id);
}

// Stub or import getNode (fetches a node by id)
function getNode(nodeId: number): ConversationNode | null {
  // Try to find node in current channel or other store
  // For example:
  const node = channelStore.getChannelNode(channelId.value, nodeId);
  return node ?? null;
}

// Watch for route changes on channel_id and reload data
watch(
  () => route.params.channel_id,
  async (newId, oldId) => {
    if (newId !== oldId) {
      await loadChannelData();
      selectionChanged(Number(newId));
    }
  }
);

// Called when selected node changes from the node tree component
function selectionChanged(newSelectedNodeId: number) {
  selectedNodeId.value = newSelectedNodeId;
  selectedNode.value = channelStore.getChannelNode(channelId.value, newSelectedNodeId);

  // If node belongs to a different channel, update channelId
  const correctChannelId = channelStore.getChannelOfNode(newSelectedNodeId);
  if (correctChannelId) {
    channelId.value = Number(correctChannelId);
  }
}

// Load guild, roles, and channel data
async function loadChannelData() {
  await Promise.all([
    guildStore.ensureGuild(guildId.value),
    roleStore.ensureAllRoles(),
    channelStore.ensureChannelConversation(channelId.value, guildId.value),
  ]);
  const channel = channelStore.channels[channelId.value];
  if (channel && channel.children && Object.keys(channel.children).length > 0) {
    const rootNode = Object.values(channel.children).find(
      (n: any) => n.parent_id === null
    );
    selectedNodeId.value = rootNode?.id ?? undefined;
  } else {
    selectedNodeId.value = channel.id;
    selectedNode.value = channelStore.getChannelNode(channelId.value, selectedNodeId.value);
  }
}

async function editNode(nodeId: number) {
  if (typeof nodeId === 'number') {
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

    // Wait for DOM updates, then set focus if possible
    await nextTick();
    const formKey = `editForm_${nodeId}`;
    form.value = nodeForms.value[formKey];
    if (form.value?.setFocus) {
      form.value.setFocus();
    }
  }
}

onBeforeMount(async () => {
  await loadChannelData();
  ready.value = true;
});

</script>
<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Breadcrumbs styling */
.q-breadcrumbs {
  background-color: #1976d2; /* Quasar primary */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgb(25 118 210 / 0.3);
}

.q-breadcrumbs-el--active {
  font-weight: 700;
  color: #ffd54f; /* warm accent */
}

/* Channel Title */
.channel-title {
  position: relative;
  font-weight: 700;
  background: linear-gradient(90deg, #42a5f5, #478ed1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  margin-bottom: 1rem;
}

.channel-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  background-color: #42a5f5;
  border-radius: 2px;
  margin-top: 0.25rem;
}

/* Node Tree Section Header */
.tree-header {
  color: #1976d2; /* primary dark */
  font-weight: 600;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #1976d2;
  padding-bottom: 0.3rem;
  margin-bottom: 1rem;
}

/* Selected Node Card */
.selected-node-card {
  background-color: #e3f2fd; /* light blue tint */
  border-radius: 8px;
}

.selected-node-header {
  border-bottom: 2px solid #2196f3; /* bright blue */
  padding-bottom: 0.3rem;
  color: #1565c0;
}

/* Badges */
.q-badge {
  font-weight: 600;
}

/* Buttons hover effect */
.hover-glow {
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
  border-radius: 6px;
}

.hover-glow:hover {
  background-color: rgba(33, 150, 243, 0.1);
  box-shadow: 0 0 6px #2196f3;
}

.reply-btn {
  color: #0d47a1;
}

.edit-btn {
  color: #004d40;
}

/* Loading spinner area */
.loading-area {
  min-height: 150px;
  background-color: #bbdefb; /* very light blue */
  border-radius: 8px;
  color: #1976d2;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

