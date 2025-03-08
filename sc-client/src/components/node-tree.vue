<template>
  <div class="q-pb-xl" v-if="ready">
    <div class="row justify-end" style="width: 100%; background-color: #d3d3d3">
      <q-btn icon="menu" :flat="true" :dense="true">
        <q-menu>
          <q-list>
            <q-item>
              <q-input
                label="Search"
                type="text"
                v-model="searchFilter"
              ></q-input>
            </q-item>
            <q-item
              v-if="NodeTreeProps.currentGuildId && !NodeTreeProps.channelId"
            >
              <q-checkbox
                v-model="showDraft"
                label="Draft nodes"
                :dense="true"
              ></q-checkbox>
            </q-item>
            <q-item
              v-if="NodeTreeProps.currentGuildId && !NodeTreeProps.channelId"
            >
              <q-checkbox
                v-model="showMeta"
                label="Meta nodes"
                :dense="true"
              ></q-checkbox>
            </q-item>
            <q-item
              v-if="NodeTreeProps.currentGuildId && !NodeTreeProps.channelId"
            >
              <q-checkbox
                v-model="showFocusNeighbourhood"
                label="Focus neighbourhood"
                :dense="true"
                v-on:input="changeNeighbourhood"
              ></q-checkbox>
            </q-item>
            <q-item>
              <q-checkbox
                v-model="showObsolete"
                :dense="true"
                label="Obsolete nodes"
              ></q-checkbox>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
    <q-tree
      v-if="nodesTree"
      ref="tree"
      :nodes="nodesTree"
      node-key="id"
      label-key="title"
      :key="treeSize"
      default-expand-all
      @update:selected="selectionChanged"
      v-model:selected="selectedNodeId"
      :filter-method="filterMethod"
      :filter="searchFilter_"
    >
      <template v-slot:default-header="{ node }">
        <div class="row items-center" v-if="node.id" :ref="'node_' + node.id">
          <q-icon :name="node.icon" class="q-mr-sm" />
          <span
            :class="
              'node-title node-status-' +
              node.status +
              ' node-meta-' +
              node.meta
            "
          >
            {{ node.label }}</span
          >
          <span class="node-creator">{{
            getMemberHandle(node.creator_id)
          }}</span>

          <span class="threat-status" v-if="threats && threats[node.id]"
            >&nbsp;[<span
              v-if="scores && scores[node.id]"
              :class="
                'score' +
                (currentGuildId == node.guild_id
                  ? ' my-score'
                  : ' other-score') +
                (scores[node.id] < 0 ? ' score-neg' : ' score-pos')
              "
              >{{ scores[node.id] }}</span
            >&nbsp;{{ threats[node.id] }}]</span
          >
          <q-btn
            :flat="true"
            v-if="
              editable &&
              canEdit(node.id) &&
              !editingNodeId &&
              !addingChildToNodeId
            "
            icon="edit"
            @click="editNode(node.id)"
          />
          <q-btn
            v-if="canAddChild(node.id)"
            flat
            icon="add"
            @click="addChildToNode(node.id)"
          />
          <read-status-counter-button
            class="q-ml-md"
            :node_id="node.id"
            :isChannel="isChannel"
            :isExpanded="checkIfExpanded(node.id)"
            :isRead="readStatus(node.id)"
          ></read-status-counter-button>
        </div>
        <div class="row q-mt-md q-ml-lg">
          <span class="node-status">{{ node.status }}</span>
        </div>
      </template>
      <template v-slot:default-body="prop">
        <div
          v-if="prop.node.id != editingNodeId && !hideDescription"
          class="row"
        >
          <div v-if="prop.node.url" class="q-mt-md q-mb-md">
            <a v-bind:href="prop.node.url" target="_blank">
              {{ prop.node.url }}
            </a>
          </div>
        </div>
        <div
          class="scrollable-div q-pt-md q-pb-md"
          v-html="prop.node.description"
        ></div>
        <node-form
          :ref="nodeFormRef(prop.node.id)"
          v-if="editable && prop.node.id == editingNodeId"
          :nodeInput="selectedNode(true)"
          :allowAddChild="false"
          :ibisTypes="selectedIbisTypes"
          :editing="true"
          :roles="roleStore.getRoles"
          :allowChangeMeta="allowChangeMeta"
          :pubFn="calcSpecificPubConstraints"
          v-on:action="confirmEdit"
          v-on:cancel="cancel"
        />
        <node-form
          :ref="nodeFormRef(prop.node.id)"
          v-if="editable && prop.node.id == addingChildToNodeId"
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
      </template>
    </q-tree>
  </div>
</template>
<script setup lang="ts">
import {
  Casting,
  ConversationNode,
  Guild,
  PublicMember,
  QTreeNode,
  QuestData,
} from '../types';
import NodeForm from './node-form.vue';
import ReadStatusCounterButton from './read-status-counter-button.vue';
import { ibis_child_types } from '../stores/conversation';
import { QTree, useQuasar } from 'quasar';
import {
  ibis_node_type_type,
  ibis_node_type_list,
  publication_state_enum,
  publication_state_type,
  publication_state_list,
} from '../enums';
import { ThreatMap, ScoreMap } from '../scoring';
import { useChannelStore } from '../stores/channel';
import { useConversationStore } from '../stores/conversation';
import { useGuildStore } from '../stores/guilds';
import { useMembersStore } from '../stores/members';
import { useQuestStore } from '../stores/quests';
import { computed, nextTick, onBeforeMount, ref, shallowRef, watch } from 'vue';
import { useReadStatusStore } from '../stores/readStatus';
import { useRoleStore } from '../stores/role';
// Quasar
const $q = useQuasar();
// Stores
const channelStore = useChannelStore();
const conversationStore = useConversationStore();
const guildStore = useGuildStore();
const questStore = useQuestStore();
const readStatusStore = useReadStatusStore();
const membersStore = useMembersStore();
const roleStore = useRoleStore();
// Emits
const emit = defineEmits<{
  selectionChanged: [id: number];
}>();
// Props
const NodeTreeProps = defineProps<{
  currentQuestId: number | undefined;
  currentGuildId: number | undefined;
  channelId: number | undefined;
  isChannel: boolean;
  editable: boolean;
  hideDescription?: boolean;
  initialSelectedNodeId?: number | undefined;
}>();
// Reactive Variables
const showFocusNeighbourhood = ref(false);
const showDraft = ref(true);
const ready = ref(false);
const showMeta = ref(true);
const showObsolete = ref(false);
const selectedNodeId = ref<number | null | undefined>(null);
const searchFilter = ref('');
const editingNodeId = ref<number | null>(null);
const addingChildToNodeId = ref<number | null>(null);
const allowChangeMeta = ref(false);
const newNode = ref<Partial<ConversationNode>>({});
const tree = ref<QTree>();
const form = ref<InstanceType<typeof NodeForm> | null>(null);
const nodeForms = shallowRef<
  Record<string, InstanceType<typeof NodeForm> | null>
>({});
// Non Reactive Variables
let baseNodePubStateConstraints: publication_state_type[];
let listenerInstalled = false;
let selectedIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
let childIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
// Computed Properties
const nodeFormRef = computed(
  () =>
    (nodeId: string | number) =>
    (el: InstanceType<typeof NodeForm> | null) => {
      nodeForms.value[`editForm_${nodeId}`] = el;
    },
);
const canAddChild = computed(() => {
  return (nodeId) => {
    return (
      NodeTreeProps.editable &&
      canAddTo(nodeId) &&
      !editingNodeId.value &&
      !addingChildToNodeId.value
    );
  };
});
const searchFilter_ = computed(() => {
  return searchFilter.value + '_';
});
const getMemberHandle = computed(() => (id: number) => {
  const member = membersStore.getMemberById(id) as PublicMember;
  if (member) {
    if (questStore.getCurrentQuest && !NodeTreeProps.channelId) {
      const castings = (questStore.getCurrentQuest.casting as Casting[]) || [];
      const guild_id = castings.find((c) => c.member_id == id)?.guild_id;
      if (guild_id) {
        const guild = guildStore.getGuildById(guild_id) as Guild;
        return `${member.handle} of ${guild?.name}`;
      }
    }
    return member.handle;
  }
  return '';
});
const selectedNode = computed(() => (copy?: boolean) => {
  let node = getNode(selectedNodeId.value!);
  if (copy) {
    node = { ...node! };
  }
  return node;
});
const threats = computed((): ThreatMap | undefined => {
  if (NodeTreeProps.channelId) return undefined;
  if (NodeTreeProps.currentGuildId && showDraft.value)
    return conversationStore.getPrivateThreatMap;
  return conversationStore.getThreatMap;
});
const scores = computed((): ScoreMap | undefined => {
  if (NodeTreeProps.channelId) return undefined;
  if (NodeTreeProps.currentGuildId && showDraft.value)
    return conversationStore.getPrivateScoreMap;
  return conversationStore.getScoreMap;
});
const readStatus = computed(
  () =>
    (id: number): boolean =>
      readStatusStore.getNodeReadStatus(id),
);
const getNodesTree = () => {
  if (NodeTreeProps.channelId) {
    return channelStore.getChannelConversationTree(NodeTreeProps.channelId);
  }
  if (showFocusNeighbourhood.value) {
    return conversationStore.getNeighbourhoodTree;
  }
  if (NodeTreeProps.currentGuildId) {
    return conversationStore.getPrivateConversationTree;
  }
  return conversationStore.getConversationTree;
};

const nodesTree = ref<Partial<QTreeNode[]> | undefined | null>(getNodesTree());
const treeSize = computed((): number | undefined => {
  const nodesTree = getNodesTree();
  return nodesTree ? readStatusStore.getNodeSize(nodesTree[0].id) : undefined;
});

const canEdit = computed(() => (nodeId: number): boolean => {
  const quest = questStore.getQuestById(NodeTreeProps.currentQuestId!);
  if (quest && (!quest.is_playing || quest.status == 'finished')) return false;
  if (NodeTreeProps.channelId) {
    return channelStore.canEdit(NodeTreeProps.channelId, nodeId);
  } else {
    return conversationStore.canEdit(nodeId);
  }
});
// Watches
watch(
  [
    NodeTreeProps,
    showFocusNeighbourhood,
    () => conversationStore.getConversationTree,
  ],
  () => {
    nodesTree.value = getNodesTree();
  },
  { deep: true },
);

// Functions
function checkIfExpanded(nodeId: QTreeNode): boolean {
  const qtree = tree.value;
  if (qtree) {
    const isExpanded = qtree.isExpanded(nodeId);
    if (isExpanded) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}
function calcPublicationConstraints(node: Partial<ConversationNode>) {
  if (!NodeTreeProps.currentGuildId) {
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
  if (node.meta == 'channel' || !NodeTreeProps.currentGuildId)
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
function filterMethod(node: Partial<ConversationNode>, filter_string: string) {
  if (!showObsolete.value && node.status == 'obsolete') return false;
  if (!showMeta.value && node.meta == 'meta') return false;
  if (!showDraft.value && node.status != 'published') return false;
  if (filter_string.length > 1) {
    const search_string = searchFilter.value.toLowerCase();
    if (
      node.title!.toLowerCase().indexOf(search_string) < 0 &&
      (node.description || '').toLowerCase().indexOf(search_string) < 0
    )
      return false;
  }
  return true;
}
function canAddTo(nodeId: number): boolean {
  const quest = questStore.getQuestById(
    NodeTreeProps.currentQuestId!,
  ) as QuestData;
  if (quest) {
    return (
      (quest.is_playing || quest.is_quest_member) && quest.status != 'finished'
    );
  } else if (NodeTreeProps.channelId) {
    return !!guildStore.isGuildMember(NodeTreeProps.currentGuildId!);
  }
  return false;
}
function getNode(nodeId: number | null): ConversationNode | undefined {
  if (NodeTreeProps.channelId) {
    return channelStore.getChannelNode(NodeTreeProps.channelId, nodeId!);
  } else {
    return conversationStore.getConversationNodeById(nodeId!);
  }
}
function editNode(nodeId: number) {
  if (typeof nodeId == 'number') {
    const selectedNode = getNode(nodeId);
    newNode.value = {
      ...selectedNode,
    };
    addingChildToNodeId.value = null;
    if (selectedNode!.parent_id) {
      const parent = getNode(selectedNode!.parent_id);
      selectedIbisTypes = ibis_child_types(parent!.node_type);
      allowChangeMeta.value =
        parent!.meta == 'conversation' &&
        conversationStore.canMakeMeta(nodeId!);
    } else {
      selectedIbisTypes = ibis_node_type_list;
      allowChangeMeta.value = false;
    }
    calcPublicationConstraints(selectedNode!);
    editingNodeId.value = nodeId;
  }
  setTimeout(() => {
    const formKey = `editForm_${nodeId}`;
    form.value = nodeForms.value[formKey];
    if (form.value?.setFocus) form.value.setFocus();
  }, 0);
}
function addChildToNode(nodeId: number | null) {
  const formKey = `addChildForm_${nodeId}`;
  editingNodeId.value = null;
  const parent = getNode(nodeId);
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
    if (form.value) form.value!.setFocus;
  }, 0);
}
function cancel() {
  editingNodeId.value = null;
  addingChildToNodeId.value = null;
  newNode.value = {};
}
async function confirmAddChild(node: ConversationNode) {
  try {
    if (NodeTreeProps.channelId) {
      await channelStore.createChannelNode(node);
    } else {
      await conversationStore.createConversationNode(node);
    }
    cancel();
    nodesTree.value = getNodesTree();
  } catch (error) {
    console.error('Error adding child node:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to add node. Please try again.',
    });
  }
}
async function confirmEdit(node: Partial<ConversationNode>) {
  try {
    if (NodeTreeProps.channelId) {
      await channelStore.updateChannelNode(node);
    } else {
      await conversationStore.updateConversationNode(node);
    }
    cancel();
    nodesTree.value = getNodesTree();
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
function selectionChanged(id: number) {
  if (id === null) {
    return;
  }
  selectedNodeId.value = id;
  emit('selectionChanged', id);
}
async function changeNeighbourhood() {
  ready.value = false;
  await treePromise();
  ready.value = true;
}
async function treePromise() {
  if (showFocusNeighbourhood.value) {
    let node_id: number | null | undefined =
      questStore.getCurrentGamePlay?.focus_node_id;
    if (typeof node_id == 'number') {
      if (!node_id) {
        await conversationStore.ensureRootNode(NodeTreeProps.currentQuestId);
        node_id = conversationStore.getRootNode?.id;
      }
      if (!NodeTreeProps.initialSelectedNodeId) selectedNodeId.value = node_id;
      return await conversationStore.ensureConversationNeighbourhood(
        node_id!,
        NodeTreeProps.currentGuildId,
      );
    }
  }
  if (NodeTreeProps.channelId) {
    return await channelStore.ensureChannelConversation(
      NodeTreeProps.channelId,
      NodeTreeProps.currentGuildId!,
    );
  }
  return await conversationStore.ensureConversation(
    NodeTreeProps.currentQuestId!,
  );
}
function keyResponder(evt: KeyboardEvent) {
  const qtree = tree.value;
  const targetElement = evt.target as HTMLElement | null;
  if (!(selectedNodeId.value || addingChildToNodeId)) return;
  if (!qtree) return;
  if (!targetElement) return;
  const nodeName = targetElement.nodeName;
  const inField = !(nodeName == 'BODY' || nodeName == 'DIV');
  if (editingNodeId.value || addingChildToNodeId) {
    if (evt.key == 'Escape' || (evt.key == 'Enter' && nodeName == 'BODY')) {
      editingNodeId.value = null;
      addingChildToNodeId.value = null;
      evt.preventDefault();
    }
    return;
  }
  if (inField) return;
  switch (evt.key) {
    case 'ArrowUp':
      if (selectPrevious()) evt.preventDefault();
      break;
    case 'ArrowDown':
      if (selectNext()) evt.preventDefault();
      break;
    case 'ArrowLeft':
      qtree.setExpanded(selectedNodeId, false);
      evt.preventDefault();
      break;
    case 'ArrowRight':
      qtree.setExpanded(selectedNodeId, true);
      evt.preventDefault();
      break;
    case 'Enter':
      if (
        NodeTreeProps.editable &&
        conversationStore.canEdit(selectedNodeId.value!) &&
        !editingNodeId.value &&
        !addingChildToNodeId.value
      ) {
        editNode(selectedNodeId.value!);
        evt.preventDefault();
      }
      break;
    case '+':
      if (
        NodeTreeProps.editable &&
        !editingNodeId.value &&
        !addingChildToNodeId.value
      ) {
        addChildToNode(selectedNodeId.value!);
        evt.preventDefault();
      }
  }
}
function hiddenByCollapse(qnode: QTreeNode) {
  const qtree = tree.value;
  while (qnode) {
    qnode = qnode.parent!;
    if (!qnode) break;
    if (!qtree!.isExpanded(qnode.id)) return true;
  }
  return false;
}
function inSearchFilter(qnode: QTreeNode) {
  if (filterMethod(qnode, searchFilter_.value)) return true;
  for (const child of qnode.children || []) {
    if (inSearchFilter(child)) return true;
  }
  return false;
}
function scrollToNode(id: number | null, later: number | null = null): void {
  if (id === null) {
    console.warn(
      '[scrollToNode] Called with null id. No action will be taken.',
    );
    return;
  }
  if (later !== null) {
    setTimeout(() => scrollToNode(id, null), later);
    return;
  }
  nextTick(() => {
    const element = document.querySelector<HTMLElement>(`[ref="node_${id}"]`);
    if (element) {
      element.scrollIntoView({ block: 'start' });
    } else {
      console.warn(`[scrollToNode] Element with ref "node_${id}" not found.`);
    }
  });
}

function selectPrevious() {
  const qtree = tree;
  const sequence = conversationStore.getTreeSequence;
  let pos = sequence.indexOf(selectedNodeId.value!) - 1;
  while (pos >= 0) {
    const node_id = sequence[pos--];
    const qnode = qtree.value!.getNodeByKey(node_id) as QTreeNode;
    if (qnode && filterMethod(qnode, '') && !hiddenByCollapse(qnode)) {
      if (searchFilter.value.length > 0 && !inSearchFilter(qnode)) {
        continue;
      }
      selectionChanged(qnode.id);
      scrollToNode(qnode.id, 10);
      return true;
    }
  }
}
function selectNext() {
  const qtree = tree;
  const sequence = conversationStore.getTreeSequence;
  let pos = sequence.indexOf(selectedNodeId.value!) + 1;
  while (pos < sequence.length) {
    const node_id = sequence[pos++];
    const qnode = qtree.value!.getNodeByKey(node_id) as QTreeNode;
    if (qnode && filterMethod(qnode, '') && !hiddenByCollapse(qnode)) {
      if (searchFilter.value.length > 0 && !inSearchFilter(qnode)) {
        continue;
      }
      selectionChanged(qnode.id);
      scrollToNode(qnode.id, 10);
      return true;
    }
  }
}
async function ensureData() {
  // not sure I want this much before each update
  let promises = [roleStore.ensureAllRoles()];
  if (NodeTreeProps.currentQuestId) {
    promises = [
      ...promises,
      questStore.ensureQuest({ quest_id: NodeTreeProps.currentQuestId }),
      membersStore.ensurePlayersOfQuest(NodeTreeProps.currentQuestId),
    ];
  }
  if (NodeTreeProps.currentGuildId) {
    promises = [
      ...promises,
      guildStore.ensureGuild(NodeTreeProps.currentGuildId),
      membersStore.ensureMembersOfGuild({
        guildId: NodeTreeProps.currentGuildId,
      }),
    ];
  }
  await Promise.all(promises);
  promises = [treePromise()];
  if (NodeTreeProps.currentQuestId)
    promises.push(
      membersStore.ensureMemberById(questStore.getCurrentQuest!.creator),
    );
  await Promise.all(promises);
}
// Lifecycle Hooks
onBeforeMount(async () => {
  if (listenerInstalled) document.removeEventListener('keyup', keyResponder);
  if (!listenerInstalled) {
    document.addEventListener('keyup', keyResponder);
    listenerInstalled = true;
  }
  selectedNodeId.value = NodeTreeProps.initialSelectedNodeId;
  if (NodeTreeProps.currentGuildId) {
    showDraft.value = true;
    if (!NodeTreeProps.channelId) showFocusNeighbourhood.value = false;
  }
  await ensureData();
  if (conversationStore.getRootNode) {
    await readStatusStore.ensureAllQuestsReadStatus();
  }
  if (NodeTreeProps.channelId) {
    await readStatusStore.ensureAllChannelReadStatus();
  }
  scrollToNode(selectedNodeId.value!, 100);
  ready.value = true;
});
</script>
<style scoped>
/* General Styling */
.node-status {
  display: block;
  font-size: 0.9em;
  color: gray;
  margin-top: 0.5em;
}

.node-title {
  font-family: 'Arial', sans-serif;
  font-size: 12pt;
  font-weight: bold;
  color: #333;
}

.node-creator {
  color: #555;
  font-size: 10pt;
  margin-left: 1em;
  margin-right: 1em;
  font-style: italic;
}

.threat-status {
  color: grey;
  font-size: small;
  margin-left: 0.5em;
}

.score {
  font-size: small;
  padding: 2px 5px;
  border-radius: 4px;
}

.q-tree__node--selected {
  border: 1px dashed #bbb;
  margin: 2px -1px -1px -1px;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 4px;
}

/* Node Status Colors */
.node-status-private_draft {
  color: red;
  font-weight: bold;
}

.node-status-proposed {
  color: green;
  font-weight: bold;
}

.node-status-role_draft {
  color: orangered;
  font-weight: bold;
}

.node-status-guild_draft {
  color: orange;
  font-weight: bold;
}

.node-status-published {
  color: black;
  font-weight: bold;
}

.node-status-submitted {
  color: purple;
  font-weight: bold;
}

.node-status-obsolete {
  color: grey;
  font-weight: bold;
  text-decoration: line-through;
}

/* Meta Node Styling */
.node-meta-meta {
  background-color: #e0e0e0;
  padding: 2px 4px;
  border-radius: 4px;
}

/* Score Styling */
.score-neg.my-score {
  color: red;
  background-color: #ffe5e5;
}

.score-pos.my-score {
  color: green;
  background-color: #e5ffe5;
}

.score-neg.other-score {
  color: blue;
  background-color: #e5f0ff;
}

.score-pos.other-score {
  color: orange;
  background-color: #fff5e5;
}

/* Scrollable Div */
.scrollable-div {
  width: 75%;
  padding: 1em;
  color: #666;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow-y: auto;
}

/* Buttons */
.q-btn {
  border-radius: 1px;
  padding: 2px;
}

.q-btn[icon='edit'] {
  background-color: #f2f0ff;
  color: #333333;
  border-radius: 1px;
  padding: 2px;
}

.q-btn[icon='add'] {
  background-color: #f8fff0;
  color: #333;
  border-radius: 1px;
  padding: 2px;
}

.q-btn:hover {
  filter: brightness(0.9);
}

/* Tree Node Styling */
.row.items-center {
  align-items: center;
  padding: 5px 10px;
  border-bottom: 1px solid #e0e0e0;
}

.row.q-mt-md.q-ml-lg {
  margin-left: 1.5em;
  font-size: 0.9em;
  color: #888;
}
</style>
