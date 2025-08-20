<template>
  <q-page v-if="ready" class="bg-secondary quest-play-page">
         <div class="q-ml-md" style="display: flex; justify-content: flex-end;">
          <member />
        </div>
    <!-- Quest Details & Actions -->
    <div class="row justify-center q-pa-md" style="max-width: 1200px; margin: 0 auto; width: 100%">
      <q-card
  flat
  bordered
  class="q-mb-md q-pa-md rounded-borders shadow-2"
  style="width: 100%; background-color: transparent"
>
  <section class="q-mb-md">
    <quest-details />
  </section>

  <q-separator spaced />

  <section class="q-mt-md">
    <quest-actions :myPlayingGuilds="myPlayingGuilds" :questId="questId" />
  </section>

  <q-separator spaced />

 <div class="row justify-center q-mt-xl">
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


      <!-- Main content: Node Tree + Selected Node -->
      <div class="row q-mt-md" style="width: 100%">
        <!-- Left: Quest Node Tree -->
        <div class="col-12 col-md-9">
          <q-card class="q-pa-md" style="height: 100%;">
            <quest-node-tree
              :questId="questId"
              :guildId="guildId"
              :selectedNodeId="selectedNodeId"
            />
          </q-card>
        </div>

        <!-- Right: Selected Node -->
        <transition name="fade">
          <div class="col-12 col-md-3" v-if="selectedNode">
            <q-card flat bordered class="q-pa-md shadow-2 rounded-borders selected-node-card" style="height: 100%;">
              <h3 class="text-h6 text-primary text-weight-bold q-mb-sm row items-center selected-node-header">
                <q-icon name="label_important" class="q-mr-sm" />
                Selected Node
              </h3>
              <q-card-section>
                <div class="text-h6 text-primary q-mb-sm">
                  {{ selectedNode!.title || 'Selected Node' }}
                </div>
                <div class="text-caption text-grey">
                  Node ID: {{ selectedNode!.id }}
                  <q-badge v-if="selectedNode!.parent_id === null" color="deep-orange" class="q-ml-xs">
                    Root
                  </q-badge>
                </div>
                <div class="scrollable-description q-mb-md" style="max-height: 200px; overflow-y: auto;">
                  <div v-if="selectedNode!.description" v-html="selectedNode!.description" class="node-card-details" />
                  <div v-else class="text-grey">No description provided.</div>
                </div>
              </q-card-section>
              <q-separator />
              <EditButton
                :nodeId="selectedNode!.id"
                :questId="questId"
                @click="editNode(selectedNode!.id)"
              />
              <q-btn
                v-if="canAddChild()"
                flat
                icon="add"
                @click="addChildToNode(selectedNodeId!)"
              />
            </q-card>
          </div>
        </transition>
      </div>
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
  </q-page>
</template>
<script setup lang="ts">
import member from '../components/member-handle.vue';
import questNodeTree from '../components/quest-node-tree.vue';
import questDetails from '../components/quest-details.vue';
import questActions from '../components/quest-actions.vue';
import { waitUserLoaded } from '../app-access';
import { useRoute } from 'vue-router';
import { ref, computed, onMounted, watch, nextTick, ComponentPublicInstance } from 'vue'; // added nextTick
import { useQuestStore } from '../stores/quests';
import { useGuildStore } from '../stores/guilds';
import { useMemberStore } from '../stores/member';
import { ConversationNode, GuildData, GuildMembership, QTreeNode } from '../types';
import { useConversationStore } from '../stores/conversation';
import { ibis_child_types}  from '../stores/conversation'
import { ibis_node_type_list, ibis_node_type_type, publication_state_enum, publication_state_list, publication_state_type } from'../enums'
import EditButton from '../components/edit-button.vue';
import NodeForm from '../components/node-form.vue';
import { useRoleStore } from '../stores/role';
import { useQuasar } from 'quasar';

type NodeFormInstance = ComponentPublicInstance<{
  setFocus: () => void;
}>;
// Stores
const questStore = useQuestStore();
const guildStore = useGuildStore();
const memberStore = useMemberStore();
const conversationStore = useConversationStore();
const roleStore = useRoleStore();

// Route
const route = useRoute();

// Quasar
const $q = useQuasar();

// Reactive Variables
const ready = ref(false);
const questId = ref<number | undefined>(undefined);
const mySelectedPlayingGuildId = ref<number | undefined>(undefined);
const newNode = ref({});
const addingChildToNodeId = ref<number | null>(null);
const selectedIbisTypes = ref<any[]>([]);
const allowChangeMeta = ref(false);
const editingNodeId = ref<number | null>(null);
const form = ref<NodeFormInstance | null>(null);
const editable = ref<boolean>(true)
const nodesTree = ref<QTreeNode[]>([]);
const showFocusNeighbourhood = ref(false);
const nodeForms = ref<Record<string, NodeFormInstance | null>>({});

const parseNodeId = (param: string | string[] | undefined): number | undefined => {
  if (typeof param === 'string') {
    return Number.parseInt(param);
  } else if (Array.isArray(param) && param.length > 0) {
    return Number.parseInt(param[0]);
  }
  return undefined;
};

const selectedNodeId = ref<number | undefined>(parseNodeId(route.params.node_id));

// Variables
let myPlayingGuilds: GuildData[] = [];
let baseNodePubStateConstraints: publication_state_type[];
let childIbisTypes: ibis_node_type_type[] = ibis_node_type_list;

// Lifecycle Hooks
onMounted(async () => {
  ready.value = false;
  await initialize();
  ready.value = true;
});

// Computed Properties
const selectedNode = computed(() => {
  if (selectedNodeId.value != null) {
    return conversationStore.getConversationNodeById(selectedNodeId.value);
  }
  return undefined;
});
const guildId = computed(() => {
  const quest_id = questStore.getCurrentQuest?.id;
  const casting = memberStore.castingPerQuest[quest_id!];
  return casting ? casting.guild_id : undefined;
});
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
// Watches
watch(guildId, async () => {
  await initializeGuildInner();
});
watch(questId, async () => {
  await initialize();
});
watch(
  () => route.params.node_id,
  (newVal) => {
    selectedNodeId.value = parseNodeId(newVal);
  }
);
watch(selectedNode, (val) => {
  console.log('selectedNode changed:', val);
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
async function confirmAddChild(node: ConversationNode) {
  try {
    await conversationStore.createConversationNode(node);
    cancel();
    nodesTree.value = getNodesTree() ?? [];
  } catch (error) {
    console.error('Error adding child node:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to add node. Please try again.',
    });
  }
}
const getNodesTree = (): QTreeNode[] => {
  if (showFocusNeighbourhood.value) {
    return conversationStore.getNeighbourhoodTree ?? [];
  }
  if (currentGuildId.value) {
    return conversationStore.getPrivateConversationTree ?? [];
  }
  return conversationStore.getConversationTree ?? [];
};
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
function cancel() {
  editingNodeId.value = null;
  addingChildToNodeId.value = null;
  newNode.value = {};
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
function guildsPlayingGame(onlyMine = false, recruiting = false) {
  let guildIds =
    questStore.getCurrentQuest?.game_play?.map((gp) => gp.guild_id) || [];
  if (onlyMine) {
    guildIds = guildIds.filter((g) =>
      memberStore.member?.guild_membership?.some(
        (gm: GuildMembership) => gm.guild_id === g && gm.status === 'confirmed',
      ),
    );
  }
  let guilds = guildIds.map((gid) => guildStore.getGuildById(gid));
  if (recruiting) {
    guilds = guilds.filter((g) => g.open_for_applications);
  }
  return guilds;
}

function getNode(nodeId: number): ConversationNode | null {
  const node = conversationStore.getConversationNodeById(nodeId);
  return node ?? null;
}
async function editNode(nodeId: number) {
  const selectedNodeLocal = getNode(nodeId);
  if (!selectedNodeLocal) {
    console.warn('Node not found:', nodeId);
    return;
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

async function initialize() {
  await waitUserLoaded();
  if (typeof route.params.quest_id === 'string') {
    questId.value = Number.parseInt(route.params.quest_id);
  }
  questStore.setCurrentQuest(questId.value!);
  await Promise.all([
    questStore.ensureQuest({ quest_id: questId.value! }),
    guildStore.ensureGuildsPlayingQuest({ quest_id: questId.value! }),
    roleStore.ensureAllRoles()
  ]);
  await initializeGuildInner();
}

async function initializeGuildInner() {
  if (guildId.value) {
    ready.value = false;
    guildStore.setCurrentGuild(guildId.value);
    await guildStore.ensureGuild(guildId.value);
    if (!selectedNodeId.value) {
      selectedNodeId.value = questStore.getCurrentGamePlay?.focus_node_id;
    }
    ready.value = true;
  } else if (memberStore.member) {
    myPlayingGuilds = guildsPlayingGame(true);
    if (myPlayingGuilds.length) {
      mySelectedPlayingGuildId.value = myPlayingGuilds[0].id;
    }
  }
}
</script>
<style scoped>
.quest-play-page {
  background: url('../statics/images/questBackgroundImage.jpg') no-repeat center
    center fixed !important;
  background-size: cover;
  min-height: 100vh;
  padding: 0rem;
  box-sizing: border-box;
}
.sidenav {
  height: 100%;
  width: 15%;
  position: fixed;
  z-index: 1;
  top: 0;
  right: 0;
  color: black;
  background-color: rgb(230, 234, 238);
  overflow-x: hidden;
  transition: 0.5s;
  padding-top: 60px;
  border: 1px solid gray;
}
.quest-name {
  text-decoration: underline;
  padding: 5px;
  margin-top: 16px;
}
.card-view-btn {
  border-radius: 30px;
  font-weight: bold;
  letter-spacing: 0.5px;
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.6); /* glow effect */
  transition: transform 0.2s ease, box-shadow 0.3s ease;
}

.card-view-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.8);
}

.floating-node-form {
  position: fixed;
  top: 100px; /* adjust as needed */
  left: 50%;
  transform: translateX(-50%);
  width: 400px; /* adjust as needed */
  z-index: 999;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  padding: 16px;
}
</style>
