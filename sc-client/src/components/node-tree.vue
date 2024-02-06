<template>
  <div class="tree-container" v-if="ready">
    <div class="row justify-end">
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
            <q-item v-if="currentGuildId && !channelId">
              <q-checkbox
                v-model="showDraft"
                label="Draft nodes"
                :dense="true"
              ></q-checkbox>
            </q-item>
            <q-item v-if="currentGuildId && !channelId">
              <q-checkbox
                v-model="showMeta"
                label="Meta nodes"
                :dense="true"
              ></q-checkbox>
            </q-item>
            <q-item v-if="currentGuildId && !channelId">
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
      ref="tree"
      :nodes="nodesTree"
      node-key="id"
      label-key="title"
      default-expand-all
      @update:selected="selectionChanged"
      :selected.sync="selectedNodeId"
      :filter-method="filterMethod"
      :filter="searchFilter_"
    >
      <template v-slot:default-header="prop">
        <div class="row items-center" :ref="'node_' + prop.node.id">
          <q-icon :name="prop.node.icon" class="q-mr-sm" />
          <span
            :class="
              'node-title node-status-' +
              prop.node.status +
              ' node-meta-' +
              prop.node.meta
            "
          >
            {{ prop.node.label }}</span
          >
          &nbsp;-&nbsp;<span class="node-creator">{{
            getMemberHandle(prop.node.creator_id)
          }}</span>
          <span class="threat-status" v-if="threats && threats[prop.node.id]"
            >&nbsp;[<span
              v-if="scores && scores[prop.node.id]"
              :class="
                'score' +
                (currentGuildId == prop.node.guild_id
                  ? ' my-score'
                  : ' other-score') +
                (scores[prop.node.id] < 0 ? ' score-neg' : ' score-pos')
              "
              >{{ scores[prop.node.id] }}</span
            >&nbsp;{{ threats[prop.node.id] }}]</span
          >
          <q-btn
            size="xs"
            :flat="true"
            v-if="
              editable &&
              canEdit(prop.node.id) &&
              !editingNodeId &&
              !addingChildToNodeId
            "
            icon="edit"
            @click="editNode(prop.node.id)"
          />
          <q-btn
            size="xs"
            :flat="true"
            v-if="
              editable &&
              canAddTo(prop.node.id) &&
              !editingNodeId &&
              !addingChildToNodeId
            "
            icon="add"
            @click="addChildToNode(prop.node.id)"
          />
          <read-status-counter-button
            class="q-ml-md"
            :node_id="prop.node.id"
            :isChannel="isChannel"
            :isExpanded="checkIfExpanded(prop.node.id)"
            :isRead="readStatusStore.getNodeReadStatus(prop.node.id)"
          ></read-status-counter-button>
        </div>
      </template>
      <template v-slot:default-body="prop">
        <div
          v-if="prop.node.id != editingNodeId && !hideDescription"
          class="row items-center"
        >
          <div v-if="prop.node.url">
            <a v-bind:href="prop.node.url" target="_blank">
              {{ prop.node.url }}
            </a>
          </div>
          <div class="node-description" v-html="prop.node.description"></div>
        </div>
        <node-form
          :ref="'editForm_' + prop.node.id"
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
          :ref="'addChildForm_' + prop.node.id"
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
import { ConversationNode, QTreeNode } from "../types";
import NodeForm from "./node-form.vue";
import ReadStatusCounterButton from "./read-status-counter-button.vue";
import {
  ConversationMap,
  ibis_child_types,
} from "../store/conversation";
import { QTree } from "quasar";
import {
  ibis_node_type_type,
  ibis_node_type_list,
  publication_state_enum,
  publication_state_type,
  publication_state_list,
} from "../enums";
import { ThreatMap, ScoreMap } from '../scoring';
import { useChannelStore } from '../stores/channel'
import { useConversationStore } from '../stores/conversation'
import { useGuildStore } from "src/stores/guilds";
import { useMembersStore } from "src/stores/members";
import { useQuestStore } from "src/stores/quests";
import { onBeforeMount, ref } from "vue";
import MemberHandle from "./member-handle.vue";
import { useReadStatusStore } from "src/stores/readStatus";
import { useRoleStore } from "src/stores/role";

const NodeTreeProps = defineProps<{
  currentQuestId: number | null;
  currentGuildId: number | undefined;
  channelId: number | null;
  isChannel: boolean; 
  editable: boolean;
  hideDescription: boolean;
  initialSelectedNodeId: number | null;    
}>();

const channelStore = useChannelStore();
const conversationStore = useConversationStore();
const guildStore = useGuildStore();
const questStore = useQuestStore();
const readStatusStore = useReadStatusStore();
const membersStore = useMembersStore();
const roleStore = useRoleStore();
const showFocusNeighbourhood = ref(false)
const showDraft = ref(true);
const ready = ref(false);
const showMeta = ref(true);
const showObsolete = ref(false);
const selectedNodeId = ref<number | null | undefined>(null);
let baseNodePubStateConstraints: publication_state_type[];
let addingChildToNodeId: number | null = null;
let  searchFilter: string = "";
let listenerInstalled = false;
const editingNodeId = ref<number | null>(null);
const allowChangeMeta = ref(false);
let selectedIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
let childIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
const newNode  = ref<Partial<ConversationNode>>({}); 

function checkIfExpanded(nodeId: QTreeNode) {
      const qtree = this.$refs.tree as QTree;
      if (qtree) {
        // For example, you can check if a node is expanded
        const isExpanded = qtree.isExpanded(nodeId);

        if (isExpanded) {
          return true;
        } else {
          return false;
        }
      }
      return false;
  }  
  function searchFilter_ () {
    return searchFilter + "_";
  }
  function nodeMap(): ConversationMap {
    if (NodeTreeProps.channelId) return channelStore.getChannelById(NodeTreeProps.channelId);
      if (showFocusNeighbourhood.value) return conversationStore.neighbourhood;
      if (NodeTreeProps.currentGuildId) return conversationStore.conversation;
      const entries: [string, ConversationNode][] = Object.entries(
        conversationStore.conversation,
      );
      return Object.fromEntries(
        entries.filter(([id, node]) => node.status == "published"),
      );
  }
  function nodesTree(): QTreeNode[] {
    if (NodeTreeProps.channelId)
      return channelStore.getChannelConversationTree(NodeTreeProps.channelId);
      if (showFocusNeighbourhood.value) return conversationStore.getNeighbourhoodTree;
      if (NodeTreeProps.currentGuildId) return conversationStore.getPrivateConversationTree;
      return conversationStore.getConversationTree;
    }
  function threats (): ThreatMap {
    if (NodeTreeProps.channelId) return null;
    if (NodeTreeProps.currentGuildId && showDraft)
        return conversationStore.getPrivateThreatMap;
      return conversationStore.getThreatMap;
    }
  function scores (): ScoreMap {
      if (NodeTreeProps.channelId) return null;
      if (NodeTreeProps.currentGuildId && showDraft) return conversationStore.getPrivateScoreMap;
      return conversationStore.getScoreMap;
    }
    //currentGuildId: "guildChanged",
    //conversation: "conversationChanged",   


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
      const children_status = conversationStore.getChildrenOf(node.id).map((n) => n.status);
      if (children_status.length > 0) {
        children_status.sort(
          (a, b) =>
            publication_state_list.indexOf(a) -
            publication_state_list.indexOf(b),
        );
        const pos = pub_states.indexOf(children_status[0]);
        if (pos > 0) pub_states.splice(0, pos);
      }
    }
    if (node.meta == "channel") {
      // clamp to guild
      const pos = pub_states.indexOf("proposed");
      if (pos >= 0) pub_states.splice(pos);
    }
    baseNodePubStateConstraints = pub_states;
  }
  function getMemberHandle(id: number) {
    const member = membersStore.getMemberById(id);
    if (member) {
      if (questStore.getCurrentQuest && !NodeTreeProps.channelId) {
        const castings = questStore.getCurrentQuest.casting || [];
        const guild_id = castings.find((c) => c.member_id == id)?.guild_id;
        if (guild_id) {
          const guild = guildStore.getGuildById(guild_id);
          return `${member.handle} of ${guild?.name}`;
        }
      }
      return member.handle;
    }
    return "";
  }

  function calcSpecificPubConstraints(node: Partial<ConversationNode>) {
    if (node.meta == "channel" || !NodeTreeProps.currentGuildId)
      return baseNodePubStateConstraints;
    const pub_states = [...baseNodePubStateConstraints];
    if (node.meta == "meta") {
      // clamp to guild
      const pos = pub_states.indexOf("proposed");
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
    const posCurrent = pub_states.indexOf(node.status);
    if (posCurrent < 0) {
      console.error("current node status not in pub_states");
      pub_states.push(node.status);
    }
    return pub_states;
  }

  function filterMethod(node: Partial<ConversationNode>, filter_string: string) {
    if (!showObsolete.value && node.status == "obsolete") return false;
    if (!showMeta.value && node.meta == "meta") return false;
    if (!showDraft.value && node.status != "published") return false;
    if (filter_string.length > 1) {
      const search_string = searchFilter.toLowerCase();
      if (
        node.title.toLowerCase().indexOf(search_string) < 0 &&
        (node.description || "").toLowerCase().indexOf(search_string) < 0
      )
        return false;
    }
    return true;
  }

  function canEdit(nodeId: number): boolean {
    const quest = questStore.getCurrentQuest;
    if (quest && (!quest.is_playing || quest.status == "finished"))
      return false;
    if (NodeTreeProps.channelId) {
      return conversationStore.canEditChannel(NodeTreeProps.channelId, nodeId);
    } else {
      return conversationStore.canEditConversation(nodeId);
    }
  }
  function canAddTo(nodeId: number): boolean {
    const quest = questStore.getCurrentQuest;
    if (quest) {
      return (
        (quest.is_playing || quest.is_quest_member) &&
        quest.status != "finished"
      );
    } else if (NodeTreeProps.channelId) {
      return !!guildStore.isGuildMember(NodeTreeProps.currentGuildId);
    }
    return false;
  }
  function getNode(nodeId: number | null): ConversationNode {
    if (NodeTreeProps.channelId) {
      return channelStore.getChannelNode(NodeTreeProps.channelId, nodeId);
    } else {
      return conversationStore.getConversationNodeById(nodeId);
    }
  }

  function editNode(nodeId: number | null) {
    const selectedNode = getNode(nodeId);
    newNode.value = {
      ...selectedNode,
    };
    addingChildToNodeId = null;
    if (selectedNode.parent_id) {
      const parent = getNode(selectedNode.parent_id);
      selectedIbisTypes = ibis_child_types(parent.node_type);
      allowChangeMeta.value =
        parent.meta == "conversation" && conversationStore.canMakeMeta(nodeId);
    } else {
      selectedIbisTypes = ibis_node_type_list;
      allowChangeMeta.value = false;
    }
    calcPublicationConstraints(selectedNode);
    editingNodeId.value = nodeId;
    const refs = this.$refs;
    setTimeout(() => {
      const form = refs[`editForm_${nodeId}`] as NodeForm;
      if (form) form.setFocus();
    }, 0);
  }
  function addChildToNode(nodeId: number | null) {
    editingNodeId.value = null;
    const parent = getNode(nodeId);
    const parent_ibis_type = parent.node_type;
    childIbisTypes = ibis_child_types(parent_ibis_type);
    allowChangeMeta.value = parent.meta === "conversation";
    newNode.value = {
      status: "private_draft",
      node_type: childIbisTypes[0],
      parent_id: nodeId,
      quest_id: parent.quest_id,
      guild_id: guildStore.getCurrentGuild.id,
      meta: parent.meta,
    };
    calcPublicationConstraints(newNode.value);
    addingChildToNodeId = nodeId;
    const refs = this.$refs;
    setTimeout(() => {
      const form = refs[`addChildForm_${nodeId}`] as NodeForm;
      if (form) form.setFocus();
    }, 0);
  }
  function cancel() {
    editingNodeId.value = null;
    addingChildToNodeId = null;
    newNode.value = {};
  }
  function toggleDisplay(nodeId: number) {
    // TODO
  }
  function selectedNode(copy?: boolean) {
    let node = getNode(selectedNodeId.value);
    if (copy) {
      node = { ...node };
    }
    return node;
  }
  async function confirmAddChild(node) {
    // const parent = this.getNode(this.addingChildToNodeId);
    try {
      if (NodeTreeProps.channelId) {
        await channelStore.createChannelNode({ data: node });
      } else {
        await conversationStore.createConversationNode({ data: node });
      }
      addingChildToNodeId = null;
      newNode.value = {};
      this.$q.notify({
        message: `Added node to conversation`,
        color: "positive",
      });
    } catch (err) {
      console.log("there was an error in adding node ", err);
      this.$q.notify({
        message: `There was an error adding new node.`,
        color: "negative",
      });
    }
  }
  async function confirmEdit(node) {
    try {
      if (NodeTreeProps.channelId) {
        await channelStore.updateChannelNode({ data: node });
      } else {
        await conversationStore.updateConversationNode({ data: node });
      }
      editingNodeId.value = null;
      this.$q.notify({
        message: `node updated`,
        color: "positive",
      });
    } catch (err) {
      console.log("there was an error in adding node ", err);
      this.$q.notify({
        message: `There was an error adding node.`,
        color: "negative",
      });
    }
  }
  function selectionChanged(id) {
    selectedNodeId.value = id;
    this.$emit("tree-selection", id);
  }
  async function changeNeighbourhood() {
    ready.value = false;
    await treePromise();
    ready.value = true;
  }
  async function treePromise() {
    if (showFocusNeighbourhood.value) {
      let node_id: number | null | undefined = questStore.getCurrentGamePlay?.focus_node_id;
      if (!node_id) {
        await conversationStore.ensureRootNode(NodeTreeProps.currentQuestId);
        node_id = conversationStore.getRootNode?.id;
      }
      if (!NodeTreeProps.initialSelectedNodeId) selectedNodeId.value = node_id;
      return await conversationStore.ensureConversationNeighbourhood({
        node_id,
        guild: NodeTreeProps.currentGuildId,
      });
    }
    if (NodeTreeProps.channelId) {
      return await conversationStore.ensureChannelConversation({
        channel_id: NodeTreeProps.channelId,
        guild: NodeTreeProps.currentGuildId,
      });
    }
    return await conversationStore.ensureConversation(NodeTreeProps.currentQuestId);
  }

  async function guildChanged() {
    // TODO. Force reload of tree
  }

  async function conversationChanged(after, before) {
    const before_ids = new Set(Object.keys(before));
    const added_ids = [...Object.keys(after)].filter(
      (id) => !before_ids.has(id),
    );
    if (added_ids.length == 1) {
      let node = after[added_ids[0]];
      const qtree = this.$refs.tree as QTree;
      if (qtree && node.parent_id) {
        setTimeout(() => {
          while (node.parent_id) {
            node = after[node.parent_id];
            qtree.setExpanded(node.id, true);
          }
        }, 0);
      }
    }
  }

  function keyResponder(evt) {
    if (!(selectedNodeId || addingChildToNodeId)) return;
    const qtree = this.$refs.tree as QTree;
    if (!qtree) return;
    const nodeName = evt.target.nodeName;
    const inField = !(nodeName == "BODY" || nodeName == "DIV");
    if (editingNodeId || addingChildToNodeId) {
      if (evt.key == "Escape" || (evt.key == "Enter" && nodeName == "BODY")) {
        editingNodeId.value = null;
        addingChildToNodeId = null;
        evt.preventDefault();
      }
      return;
    }
    if (inField) return;
    switch (evt.key) {
      case "ArrowUp":
        if (selectPrevious()) evt.preventDefault();
        break;
      case "ArrowDown":
        if (selectNext()) evt.preventDefault();
        break;
      case "ArrowLeft":
        qtree.setExpanded(selectedNodeId, false);
        evt.preventDefault();
        break;
      case "ArrowRight":
        qtree.setExpanded(selectedNodeId, true);
        evt.preventDefault();
        break;
      case "Enter":
        if (
          NodeTreeProps.editable &&
          conversationStore.canEdit(selectedNodeId) &&
          !editingNodeId &&
          !addingChildToNodeId
        ) {
          editNode(selectedNodeId.value);
          evt.preventDefault();
        }
        break;
      case "+":
        if (NodeTreeProps.editable && !editingNodeId && !addingChildToNodeId) {
          addChildToNode(selectedNodeId.value);
          evt.preventDefault();
        }
    }
  }
  function hiddenByCollapse(qnode: QTreeNode) {
    const qtree = this.$refs.tree as QTree;
    console.log(qtree);
    while (qnode) {
      qnode = qnode.parent;
      if (!qnode) break;
      if (!qtree.isExpanded(qnode.id)) return true;
    }
    return false;
  }

  function inSearchFilter(qnode: QTreeNode) {
    // assume searchFilter not empty
    if (filterMethod(qnode, searchFilter_)) return true;
    for (const child of qnode.children || []) {
      if (inSearchFilter(child)) return true;
    }
    return false;
  }

  function scrollToNode(id: number | null, later: null | number = null) {
    if (later !== null) {
      setTimeout(() => scrollToNode(id, null), later);
    } else {
      const vnode = this.$refs["node_" + id] as Element;
      if (vnode) vnode.scrollIntoView({ block: "center" });
    }
  }

  function selectPrevious() {
    const qtree = this.$refs.tree as QTree;
    const sequence = conversationStore.getTreeSequence;
    let pos = sequence.indexOf(selectedNodeId) - 1;
    while (pos >= 0) {
      const node_id = sequence[pos--];
      const qnode = qtree.getNodeByKey(node_id) as QTreeNode;
      if (
        qnode &&
        filterMethod(qnode, "") &&
        !hiddenByCollapse(qnode)
      ) {
        if (searchFilter.length > 0 && !inSearchFilter(qnode)) {
          continue;
        }
        selectionChanged(qnode.id);
        scrollToNode(qnode.id, 10);
        return true;
      }
    }
  }

  function selectNext() {
    const qtree = this.$refs.tree as QTree;
    const sequence = conversationStore.getTreeSequence;
    let pos = sequence.indexOf(selectedNodeId) + 1;
    while (pos < sequence.length) {
      const node_id = sequence[pos++];
      const qnode = qtree.getNodeByKey(node_id) as QTreeNode;
      if (
        qnode &&
        filterMethod(qnode, "") &&
        !hiddenByCollapse(qnode)
      ) {
        if (searchFilter.length > 0 && !inSearchFilter(qnode)) {
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
        membersStore.ensurePlayersOfQuest({ questId: NodeTreeProps.currentQuestId }),
      ];
    }
    if (NodeTreeProps.currentGuildId) {
      promises = [
        ...promises,
        guildStore.ensureGuild( guild_id: NodeTreeProps.currentGuildId ),
        membersStore.ensureMembersOfGuild({ guildId: NodeTreeProps.currentGuildId }),
      ];
    }
    await Promise.all(promises);
    promises = [treePromise()];
    if (NodeTreeProps.currentQuestId)
      promises.push(
        membersStore.ensureMemberById({ id: questStore.getCurrentQuest.creator }),
      );
    await Promise.all(promises);
  }

   onBeforeMount(async() => {
    if (listenerInstalled)
      document.removeEventListener("keyup", keyResponder);
    if (!listenerInstalled) {
      document.addEventListener("keyup", keyResponder);
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
    scrollToNode(selectedNodeId.value, 100);
    ready.value = true;
  })
</script>
<style>
.node-title {
  font-family: "Times New Roman", Times, serif;
  font-size: 1.2em;
}
.node-creator {
  color: black;
  font-size: small;
}
.score {
  font-size: small;
}
.threat-status {
  color: grey;
  font-size: small;
}
.q-tree__node--selected {
  border: 1px dashed #bbb;
  margin: 2px -1px -1px -1px;
  background-color: #f8f8f8;
}
.node-status-private_draft {
  color: red;
}
.node-status-proposed {
  color: green;
}
.node-status-role_draft {
  color: orangered;
}
.node-status-guild_draft {
  color: orange;
}
.node-status-published {
  color: black;
}
.node-status-submitted {
  color: purple;
}
.node-status-obsolete {
  color: grey;
}

.node-meta-meta {
  background-color: grey;
}
.score-neg.my-score {
  color: red;
}
.score-pos.my-score {
  color: green;
}
.score-neg.other-score {
  color: blue;
}
.score-neg.other-score {
  color: orange;
}
</style>
