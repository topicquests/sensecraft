<template>
  <div class="q-pb-xl" v-if="ready">
    <div class="row justify-end header-row">
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
            <q-item v-if="NodeTreeProps.currentGuildId && !NodeTreeProps.channelId">
              <q-checkbox v-model="showDraft" label="Draft nodes" :dense="true"></q-checkbox>
            </q-item>
            <q-item v-if="NodeTreeProps.currentGuildId && !NodeTreeProps.channelId">
              <q-checkbox v-model="showMeta" label="Meta nodes" :dense="true"></q-checkbox>
            </q-item>
            <q-item v-if="NodeTreeProps.currentGuildId && !NodeTreeProps.channelId">
              <q-checkbox
                v-model="showFocusNeighbourhood"
                label="Focus neighbourhood"
                :dense="true"
                v-on:input="changeNeighbourhood"
              ></q-checkbox>
            </q-item>
            <q-item>
              <q-checkbox v-model="showObsolete" :dense="true" label="Obsolete nodes"></q-checkbox>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>

    <q-tree
      v-if="Array.isArray(nodesTree) && nodesTree.length > 0"
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
        <div class="row items-center"
          v-if="node.id"
          :ref="'node_' + node.id"
          :data-node-id="'node_' + node.id"
        >
          <q-icon :name="node.icon" class="q-mr-sm" />
          <span
            :class="
              'node-title node-status-' +
              node.status +
              ' node-meta-' +
              node.meta
            "
          >
            {{ node.label }}
          </span>
          <span class="node-creator">{{ getMemberHandle(node.creator_id) }}</span>

          <span class="threat-status" v-if="threats && threats[node.id]">
            &nbsp;[<span
              v-if="scores && scores[node.id]"
              :class="
                'score' +
                (currentGuildId == node.guild_id ? ' my-score' : ' other-score') +
                (scores[node.id] < 0 ? ' score-neg' : ' score-pos')
              "
            >
              {{ scores[node.id] }}
            </span>&nbsp;{{ threats[node.id] }}]
          </span>

          <EditButton
            v-if="NodeTreeProps.editable && !editingNodeId && !isAddingChild"
            :questId="currentQuestId"
            :channelId="channelId"
            :nodeId="node.id"
            @click="editNode(node.id)"
          />

          <q-btn v-if="canAddChild()" flat icon="add" @click="addChildToNode(node.id)" />
          <read-status-counter-button
            class="q-ml-md"
            :node_id="node.id"
            :isChannel="isChannel"
            :isExpanded="checkIfExpanded(node.id)"
            :isRead="readStatus(node.id)"
          />
        </div>

        <div class="row q-mt-md q-ml-lg">
          <span class="node-status">{{ node.status }}</span>
        </div>
      </template>

      <template v-slot:default-body="prop">
        <div v-if="prop.node.id != editingNodeId && !hideDescription" class="row q-ml-sm" style="width: 90%;">
          <div v-if="prop.node.url" class="url-div">
            <a :href="prop.node.url" target="_blank">{{ prop.node.url }}</a>
          </div>
        </div>

        <div class="scrollable-div q-pt-md q-pb-md" v-html="prop.node.description"></div>

        <div v-if="NodeTreeProps.editable && prop.node.id === editingNodeId" class="floating-node-form">
          <node-form
            :ref="nodeFormRef(prop.node.id)"
            v-if="NodeTreeProps.editable && prop.node.id == editingNodeId"
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
        </div>

        <div v-if="NodeTreeProps.editable && prop.node.id == addingChildToNodeId" class="floating-node-form">
          <node-form
            :ref="nodeFormRef(prop.node.id)"
            v-if="NodeTreeProps.editable && prop.node.id == addingChildToNodeId"
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
      </template>
    </q-tree>
  </div>
</template>

<script setup lang="ts">
/* ---- imports & types (kept from original) ---- */
import {
  Casting,
  ConversationNode,
  Guild,
  PublicMember,
  QTreeNode,
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
import { computed, nextTick, onMounted, onBeforeUnmount, ref, ComponentPublicInstance, watch } from 'vue';
import { useReadStatusStore } from '../stores/readStatus';
import { useRoleStore } from '../stores/role';
import EditButton from './edit-button.vue';

type NodeFormInstance = ComponentPublicInstance<{ setFocus: () => void }>;

/* ---- Quasar + stores ---- */
const $q = useQuasar();
const channelStore = useChannelStore();
const conversationStore = useConversationStore();
const guildStore = useGuildStore();
const questStore = useQuestStore();
const readStatusStore = useReadStatusStore();
const membersStore = useMembersStore();
const roleStore = useRoleStore();

/* ---- emits + props ---- */
const emit = defineEmits<{
  'tree-selection': [id: number];
}>();

const NodeTreeProps = defineProps<{
  currentQuestId?: number;
  currentGuildId?: number;
  channelId?: number;
  isChannel: boolean;
  editable: boolean;
  hideDescription?: boolean;
  initialSelectedNodeId?: number;
}>();

/* ---- reactive state ---- */
const showFocusNeighbourhood = ref(false);
const showDraft = ref(true);
const ready = ref(false);
const selected = ref<number | null>(NodeTreeProps.initialSelectedNodeId ?? null);
const showMeta = ref(true);
const showObsolete = ref(false);
const selectedNodeId = ref<number | null | undefined>(NodeTreeProps.initialSelectedNodeId ?? null);
const searchFilter = ref('');
const editingNodeId = ref<number | null>(null);
const addingChildToNodeId = ref<number | string | null>(null);
const allowChangeMeta = ref(false);
const newNode = ref<Partial<ConversationNode>>({});
const tree = ref<QTree | null>(null);
const form = ref<NodeFormInstance | null>(null);
const nodeForms = ref<Record<string, NodeFormInstance | null>>({});
const nodesTree = ref<QTreeNode[]>([]);

/* ---- non-reactive vars ---- */
let baseNodePubStateConstraints: publication_state_type[] = [];
let listenerInstalled = false;
let selectedIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
let childIbisTypes: ibis_node_type_type[] = ibis_node_type_list;

/* ---- computed helpers ---- */
const isAddingChild = computed(() => !!addingChildToNodeId.value);
const canAddChild = computed(() => () => {
  return NodeTreeProps.editable && canAddTo() && !editingNodeId.value && !addingChildToNodeId.value;
});
const searchFilter_ = computed(() => searchFilter.value + '_');

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
  const node = getNode(selectedNodeId.value ?? null);
  return copy ? (node ? { ...node } : undefined) : node;
});

const threats = computed((): ThreatMap | undefined => {
  if (NodeTreeProps.channelId) return undefined;
  if (NodeTreeProps.currentGuildId && showDraft.value) return conversationStore.getPrivateThreatMap;
  return conversationStore.getThreatMap;
});
const scores = computed((): ScoreMap | undefined => {
  if (NodeTreeProps.channelId) return undefined;
  if (NodeTreeProps.currentGuildId && showDraft.value) return conversationStore.getPrivateScoreMap;
  return conversationStore.getScoreMap;
});
const readStatus = computed(() => (id: number): boolean => readStatusStore.getNodeReadStatus(id));

const currentQuestId = NodeTreeProps.currentQuestId;
const currentGuildId = NodeTreeProps.currentGuildId;
const channelId = NodeTreeProps.channelId;
const isChannel = NodeTreeProps.isChannel;

/* ---- core helpers ---- */
const getNodesTree = (): QTreeNode[] => {
  if (NodeTreeProps.channelId) {
    return channelStore.getChannelConversationTree(NodeTreeProps.channelId) ?? [];
  }
  if (showFocusNeighbourhood.value) {
    return conversationStore.getNeighbourhoodTree ?? [];
  }
  if (NodeTreeProps.currentGuildId) {
    return conversationStore.getPrivateConversationTree ?? [];
  }
  return conversationStore.getConversationTree ?? [];
};

/* ---- watchers ---- */
watch(
  () => [showFocusNeighbourhood.value, NodeTreeProps.channelId],
  () => {
    nodesTree.value = getNodesTree() ?? [];
  },
  { immediate: true }
);

const treeSize = computed(() => {
  const firstNode = nodesTree.value?.[0];
  return firstNode?.id ? readStatusStore.getNodeSize(firstNode.id) : undefined;
});

watch(
  [() => NodeTreeProps.currentQuestId, () => showFocusNeighbourhood.value, () => conversationStore.getConversationTree],
  () => {
    const nodes = getNodesTree();
    nodesTree.value = (nodes ?? []).filter((n): n is QTreeNode => n !== undefined);
  },
  { deep: true }
);

watch(selected, (newVal) => {
  if (newVal !== null && typeof newVal === 'number') {
    emit('tree-selection', newVal);
  }
});

/* ---- utility functions ---- */
function isNodeFormInstance(el: Element | NodeFormInstance | null): el is NodeFormInstance {
  return !!el && typeof el === 'object' && '$' in el;
}

function nodeFormRef(nodeId: string | number) {
  return (el: Element | NodeFormInstance | null) => {
    if (isNodeFormInstance(el)) {
      nodeForms.value[`editForm_${nodeId}`] = el;
    } else {
      nodeForms.value[`editForm_${nodeId}`] = null;
    }
  };
}

function checkIfExpanded(nodeId: QTreeNode | number): boolean {
  const qtree = tree.value;
  try {
    if (!qtree) return false;
    const id = (typeof nodeId === 'object' ? (nodeId as any).id : nodeId) as number;
    return !!qtree.isExpanded(id);
  } catch (err) {
    console.warn('checkIfExpanded error', err);
    return false;
  }
}

function filterMethod(node: Partial<ConversationNode>, filter_string: string) {
  if (!showObsolete.value && node.status == 'obsolete') return false;
  if (!showMeta.value && node.meta == 'meta') return false;
  if (!showDraft.value && node.status != 'published') return false;
  if (filter_string.length > 1) {
    const search_string = searchFilter.value.toLowerCase();
    if (
      (node.title || '').toLowerCase().indexOf(search_string) < 0 &&
      ((node.description || '').toLowerCase().indexOf(search_string) < 0)
    )
      return false;
  }
  return true;
}

function canAddTo(): boolean {
  const qid = NodeTreeProps.currentQuestId;
  if (qid) {
    const quest = questStore.getQuestById(qid);
    if (quest) return (quest.is_playing || quest.is_quest_member) && quest.status != 'finished';
  } else if (NodeTreeProps.channelId) {
    return !!guildStore.isGuildMember(NodeTreeProps.currentGuildId!);
  }
  return false;
}

function getNode(nodeId: number | null | undefined): ConversationNode | undefined {
  if (nodeId == null) return undefined;
  if (NodeTreeProps.channelId) {
    return channelStore.getChannelNode(NodeTreeProps.channelId, nodeId);
  } else {
    return conversationStore.getConversationNodeById(nodeId);
  }
}

/* ---- editing & add child ---- */
function editNode(nodeId: number) {
  try {
    if (typeof nodeId == 'number') {
      const selectedNodeLocal = getNode(nodeId);
      if (!selectedNodeLocal) {
        console.warn('editNode: node not found', nodeId);
        return;
      }
      newNode.value = { ...selectedNodeLocal };
      addingChildToNodeId.value = null;
      if (selectedNodeLocal.parent_id) {
        const parent = getNode(selectedNodeLocal.parent_id);
        selectedIbisTypes = ibis_child_types(parent!.node_type);
        allowChangeMeta.value = parent!.meta == 'conversation' && conversationStore.canMakeMeta(nodeId);
      } else {
        selectedIbisTypes = ibis_node_type_list;
        allowChangeMeta.value = false;
      }
      calcPublicationConstraints(selectedNodeLocal);
      editingNodeId.value = nodeId;
      setTimeout(() => {
        const formKey = `editForm_${nodeId}`;
        form.value = nodeForms.value[formKey];
        if (form.value?.setFocus) form.value.setFocus();
      }, 0);
    }
  } catch (err) {
    console.error('editNode error', err);
  }
}

function addChildToNode(nodeId: number | null) {
  try {
    editingNodeId.value = null;
    const parent = getNode(nodeId);
    if (!parent) {
      console.warn('addChildToNode: parent not found', nodeId);
      return;
    }
    const parent_ibis_type = parent.node_type;
    childIbisTypes = ibis_child_types(parent_ibis_type);
    allowChangeMeta.value = parent.meta === 'conversation';
    newNode.value = {
      status: 'private_draft',
      node_type: childIbisTypes[0],
      parent_id: nodeId!,
      quest_id: parent.quest_id,
      guild_id: guildStore.getCurrentGuild!.id,
      meta: parent.meta,
    };
    calcPublicationConstraints(newNode.value);
    addingChildToNodeId.value = nodeId;
    setTimeout(() => {
      const formKey = `addChildForm_${nodeId}`;
      form.value = nodeForms.value[formKey];
      if (form.value) form.value.setFocus();
    }, 0);
  } catch (err) {
    console.error('addChildToNode error', err);
  }
}

function cancel() {
  editingNodeId.value = null;
  addingChildToNodeId.value = null;
  newNode.value = {};
}

/* ---- create / update handlers ---- */
async function confirmAddChild(node: ConversationNode) {
  try {
    if (NodeTreeProps.channelId) {
      await channelStore.createChannelNode(node);
    } else {
      await conversationStore.createConversationNode(node);
    }
    cancel();
    nodesTree.value = getNodesTree() ?? [];
  } catch (error) {
    console.error('Error adding child node:', error);
    $q.notify({ type: 'negative', message: 'Failed to add node. Please try again.' });
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
    nodesTree.value = getNodesTree() ?? [];
    editingNodeId.value = null;
    $q.notify({ message: `node updated`, color: 'positive' });
  } catch (err) {
    console.log('there was an error in adding node ', err);
    $q.notify({ message: `There was an error updating node.`, color: 'negative' });
  }
}
function selectionChanged(id: number) {
  if (id == null) return;
  selectedNodeId.value = id;
  emit('tree-selection', id);
}
async function changeNeighbourhood() {
  ready.value = false;
  try {
    await treePromise();
    nodesTree.value = getNodesTree() ?? [];
  } catch (err) {
    console.error('changeNeighbourhood error', err);
  } finally {
    ready.value = true;
  }
}
async function scrollToNode(id: number | null | undefined, later: number | null = null): Promise<void> {
  if (id === null || id === undefined) {
    console.warn('[scrollToNode] Called with null/undefined id. No action will be taken.');
    return;
  }
  if (later !== null) {
    setTimeout(() => void scrollToNode(id, null), later);
    return;
  }
  await nextTick();
  try {
    const element = document.querySelector<HTMLElement>(`[data-node-id="node_${id}"]`);
    if (element) {
      element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      console.warn(`[scrollToNode] Node ${id} not found`);
    }
  } catch (err) {
    console.error('scrollToNode error', err);
  }
}


async function keyResponder(evt: KeyboardEvent) {
  try {
    const qtree = tree.value;
    const targetElement = evt.target as HTMLElement | null;
    if (!(selectedNodeId.value || addingChildToNodeId.value)) return;
    if (!qtree) return;
    if (!targetElement) return;
    const nodeName = targetElement.nodeName;
    const inField = !(nodeName === 'BODY' || nodeName === 'DIV');
    if (editingNodeId.value || addingChildToNodeId.value) {
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
        if (await selectPrevious()) evt.preventDefault();
        break;
      case 'ArrowDown':
        if (await selectNext()) evt.preventDefault();
        break;
      case 'ArrowLeft':
        qtree.setExpanded(selectedNodeId.value, false);
        evt.preventDefault();
        break;
      case 'ArrowRight':
        qtree.setExpanded(selectedNodeId.value, true);
        evt.preventDefault();
        break;
      case 'Enter':
        if (NodeTreeProps.editable && conversationStore.canEdit(selectedNodeId.value!) && !editingNodeId.value) {
          editNode(selectedNodeId.value!);
          evt.preventDefault();
        }
        break;
      case '+':
        if (NodeTreeProps.editable && !editingNodeId.value) {
          addChildToNode(selectedNodeId.value!);
          evt.preventDefault();
        }
    }
  } catch (err) {
    console.error('keyResponder error', err);
  }
}

/* ---- tree sequence helpers (defensive) ---- */
async function selectPrevious() {
  try {
    const qtree = tree;
    const sequence = conversationStore.getTreeSequence || [];
    const idx = sequence.indexOf(selectedNodeId.value!) - 1;
    let pos = idx;
    while (pos >= 0) {
      const node_id = sequence[pos--];
      const qnode = qtree.value?.getNodeByKey(node_id) as QTreeNode | undefined;
      if (qnode && filterMethod(qnode, '') && !hiddenByCollapse(qnode)) {
        if (searchFilter.value.length > 0 && !inSearchFilter(qnode)) continue;
        selectionChanged(qnode.id);
        await scrollToNode(qnode.id, 10);
        return true;
      }
    }
  } catch (err) {
    console.error('selectPrevious error', err);
  }
}

async function selectNext() {
  try {
    const qtree = tree;
    const sequence = conversationStore.getTreeSequence || [];
    let pos = sequence.indexOf(selectedNodeId.value!) + 1;
    while (pos < sequence.length) {
      const node_id = sequence[pos++];
      const qnode = qtree.value?.getNodeByKey(node_id) as QTreeNode | undefined;
      if (qnode && filterMethod(qnode, '') && !hiddenByCollapse(qnode)) {
        if (searchFilter.value.length > 0 && !inSearchFilter(qnode)) continue;
        selectionChanged(qnode.id);
        await scrollToNode(qnode.id, 10);
        return true;
      }
    }
  } catch (err) {
    console.error('selectNext error', err);
  }
}

/* ---- ensure data (wrapped with guards) ---- */
async function ensureData() {
  const promises: Promise<any>[] = [];
  try {
    promises.push(roleStore.ensureAllRoles());
    if (NodeTreeProps.currentQuestId) {
      promises.push(questStore.ensureQuest({ quest_id: NodeTreeProps.currentQuestId }));
      promises.push(membersStore.ensurePlayersOfQuest(NodeTreeProps.currentQuestId));
    }
    if (NodeTreeProps.currentGuildId) {
      promises.push(guildStore.ensureGuild(NodeTreeProps.currentGuildId));
      promises.push(membersStore.ensureMembersOfGuild({ guildId: NodeTreeProps.currentGuildId }));
    }
    if (NodeTreeProps.channelId) {
      promises.push(channelStore.ensureAllChannels());
    }
    await Promise.all(promises);

    // further initialization that depends on stores
    await treePromise();

    if (NodeTreeProps.currentQuestId) {
      // ensure creator loaded if possible
      try {
        await membersStore.ensureMemberById(questStore.getCurrentQuest!.creator);
      } catch (err) {
        // non-fatal
        console.warn('ensure member by id failed', err);
      }
    }
  } catch (err) {
    console.error('ensureData failed', err);
    throw err;
  }
}

/* ---- treePromise: safe guard wrapper ---- */
async function treePromise() {
  try {
    if (showFocusNeighbourhood.value) {
      let node_id: number | null | undefined = questStore.getCurrentGamePlay?.focus_node_id;
      if (typeof node_id == 'number') {
        if (!node_id) {
          await conversationStore.ensureRootNode(NodeTreeProps.currentQuestId);
          node_id = conversationStore.getRootNode?.id;
        }
        if (!NodeTreeProps.initialSelectedNodeId) selectedNodeId.value = node_id;
        return await conversationStore.ensureConversationNeighbourhood(node_id!, NodeTreeProps.currentGuildId);
      }
    }

    if (NodeTreeProps.channelId) {
      return await channelStore.ensureChannelConversation(NodeTreeProps.channelId, NodeTreeProps.currentGuildId);
    }

    if (NodeTreeProps.currentQuestId) {
      return await conversationStore.ensureConversation(NodeTreeProps.currentQuestId);
    }
  } catch (err) {
    console.error('treePromise error', err);
    throw err;
  }
}

/* ---- lifecycle: do async init onMounted with try/catch (instead of beforeMount) ---- */
onMounted(async () => {
  // attach keyboard listener once
  try {
    if (!listenerInstalled) {
      document.addEventListener('keyup', keyResponder);
      listenerInstalled = true;
    }

    // initial flags depending on incoming props
    if (NodeTreeProps.currentGuildId) {
      showDraft.value = true;
      if (!NodeTreeProps.channelId) showFocusNeighbourhood.value = false;
    }

    // do data fetching & tree build in mounted (so props are available)
    try {
      await ensureData();
    } catch (err) {
      // ensureData logs; don't break mounting
      console.error('Error during ensureData', err);
    }

    try {
      if (conversationStore.getRootNode) {
        await readStatusStore.ensureAllQuestsReadStatus();
      }
      if (NodeTreeProps.channelId) {
        await readStatusStore.ensureAllChannelReadStatus();
      }
    } catch (err) {
      console.warn('read status ensure failed', err);
    }

    // build nodes tree and attempt to scroll to initial selection
    nodesTree.value = getNodesTree() ?? [];

    // only try to scroll if we actually have an id
    if (selectedNodeId.value != null) {
      await scrollToNode(selectedNodeId.value, 100);
    }

    // finished
    ready.value = true;

    // emit initial selection if set
    if (selectedNodeId.value != null) {
      emit('tree-selection', selectedNodeId.value);
    }
  } catch (err) {
    console.error('onMounted initialization error', err);
    // set ready to true to avoid indefinite loading; UI might handle empty state
    ready.value = true;
  }
});

/* clean up */
onBeforeUnmount(() => {
  try {
    if (listenerInstalled) {
      document.removeEventListener('keyup', keyResponder);
      listenerInstalled = false;
    }
  } catch (err) {
    console.warn('error removing listener', err);
  }
});

/* methods left intact (publication constraints etc.) - copied from original but defensive */
function calcPublicationConstraints(node: Partial<ConversationNode>) {
  if (!NodeTreeProps.currentGuildId) {
    baseNodePubStateConstraints = [publication_state_enum.private_draft, publication_state_enum.published];
    return;
  }
  try {
    const pub_states = [...publication_state_list];
    if (!node) return;
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
        children_status.sort((a, b) => publication_state_list.indexOf(a) - publication_state_list.indexOf(b));
        const pos = pub_states.indexOf(children_status[0]);
        if (pos > 0) pub_states.splice(0, pos);
      }
    }
    if (node.meta == 'channel') {
      const pos = pub_states.indexOf('proposed');
      if (pos >= 0) pub_states.splice(pos);
    }
    baseNodePubStateConstraints = pub_states;
  } catch (err) {
    console.error('calcPublicationConstraints error', err);
  }
}

function calcSpecificPubConstraints(node: Partial<ConversationNode>) {
  try {
    if (node.meta == 'channel' || !NodeTreeProps.currentGuildId) return baseNodePubStateConstraints;
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
  } catch (err) {
    console.error('calcSpecificPubConstraints error', err);
    return baseNodePubStateConstraints;
  }
}

/* hiddenByCollapse / inSearchFilter */
function hiddenByCollapse(qnode: QTreeNode) {
  const qtree = tree.value;
  if (!qtree) return false;
  while (qnode) {
    qnode = qnode.parent!;
    if (!qnode) break;
    if (!qtree.isExpanded(qnode.id)) return true;
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

/* expose clearTree (keeps original behavior) */
function clearTree() {
  if (!tree.value) return;
  tree.value.setExpanded([], false);
  tree.value.selected([]);
}
defineExpose({ clearTree });

</script>

<style scoped>
/* (styles left as you originally had them — preserved to avoid visual regressions) */
.floating-node-form {
  position: fixed;
  top: 80px;               /* distance from top */
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: transparent;
  padding: 0;
  overflow: hidden;
}

.floating-node-form > * {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header-row {
  background-color: #d3d3d3;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

/* (remaining styles preserved) */
.floating-node-form .node-card { flex: 1; overflow-y: auto; padding: 1em; }

.node-status { display: block; font-size: 0.9em; color: gray; margin-top: 0.5em; }

.node-title { font-family: 'Arial', sans-serif; font-size: 12pt; font-weight: bold; color: #333; }

.node-creator { color: #555; font-size: 10pt; margin-left: 1em; margin-right: 1em; font-style: italic; }

.threat-status { color: grey; font-size: small; margin-left: 0.5em; }

.score { font-size: small; padding: 2px 5px; border-radius: 4px; }

.q-tree__node--selected { border: 1px dashed #bbb; margin: 2px -1px -1px -1px; background-color: #f5f5f5; border-radius: 4px; padding: 4px; }

.node-status-private_draft { color: red; font-weight: bold; }
.node-status-proposed { color: green; font-weight: bold; }
.node-status-role_draft { color: orangered; font-weight: bold; }
.node-status-guild_draft { color: orange; font-weight: bold; }
.node-status-published { color: black; font-weight: bold; }
.node-status-submitted { color: purple; font-weight: bold; }
.node-status-obsolete { color: grey; font-weight: bold; text-decoration: line-through; }

.node-meta-meta { background-color: #e0e0e0; padding: 2px 4px; border-radius: 4px; }

.score-neg.my-score { color: red; background-color: #ffe5e5; }
.score-pos.my-score { color: green; background-color: #e5ffe5; }
.score-neg.other-score { color: blue; background-color: #e5f0ff; }
.score-pos.other-score { color: orange; background-color: #fff5e5; }

.scrollable-div {
  width: 75%;
  padding: 1em;
  color: #666;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow-y: auto;
  overflow-x: auto;
}
.scrollable-div a {
  word-break: break-all;      /* forces long URLs to wrap */
  overflow-wrap: anywhere;    /* additional safety for modern browsers */
  display: inline-block;      /* ensures wrapping works inside flex containers */
  color: #1a0dab;             /* optional: link color */
  text-decoration: underline; /* optional: keep standard link style */
}



@media (max-width: 768px) {
  .scrollable-div {
    max-height: 200px;
    width: 90%;
    padding: 0.5em;
    word-wrap: break-word;
  }
}
@media (max-width: 768px) {
  .url-div {
    max-height: 200px;
    width: 100%;
    padding: 0.5em;
    word-wrap: break-word;
  }
}

.q-btn { border-radius: 1px; padding: 2px; }
.q-btn[icon='edit'] { background-color: #f2f0ff; color: #333333; border-radius: 1px; padding: 2px; }
.q-btn[icon='add'] { background-color: #f8fff0; color: #333; border-radius: 1px; padding: 2px; }
.q-btn:hover { filter: brightness(0.9); }

.row.items-center { align-items: center; padding: 5px 10px; border-bottom: 1px solid #e0e0e0; }

.row.q-mt-md.q-ml-lg { margin-left: 1.5em; font-size: 0.9em; color: #888; }
</style>
