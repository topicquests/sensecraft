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
          :roles="getRoles"
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
          :roles="getRoles"
          :allowChangeMeta="allowChangeMeta"
          :pubFn="calcSpecificPubConstraints"
          v-on:action="confirmAddChild"
          v-on:cancel="cancel"
        />
      </template>
    </q-tree>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters, mapActions, mapState } from "vuex";
import Component from "vue-class-component";
import { ConversationNode, QTreeNode } from "../types";
import NodeForm from "./node-form.vue";
import {
  ConversationMap,
  ConversationGetterTypes,
  ConversationActionTypes,
  ibis_child_types,
} from "../store/conversation";
import { QTree } from "quasar";
import { QuestsGetterTypes, QuestsActionTypes } from "../store/quests";
import { GuildsGetterTypes, GuildsActionTypes } from "../store/guilds";
import { RoleGetterTypes, RoleActionTypes } from "../store/role";
import {
  ibis_node_type_type,
  ibis_node_type_list,
  publication_state_enum,
  publication_state_type,
  publication_state_list,
} from "../enums";
import { ChannelGetterTypes, ChannelActionTypes } from "../store/channel";
import { ThreatMap, ScoreMap } from "../scoring";
import { MembersGetterTypes, MembersActionTypes } from "../store/members";

const NodeTreeProps = Vue.extend({
  props: {
    currentQuestId: Number || null,
    currentGuildId: Number || null,
    channelId: Number || null,
    editable: Boolean,
    hideDescription: Boolean,
    initialSelectedNodeId: Number || null,
  },
});

@Component<NodeTree>({
  components: { NodeForm },
  name: "ConversationNodeTree",
  methods: {
    ...mapActions("channel", [
      "createChannelNode",
      "updateChannelNode",
      "ensureChannelConversation",
    ]),
    ...mapActions("conversation", [
      "createConversationNode",
      "updateConversationNode",
      "ensureConversationNeighbourhood",
      "ensureRootNode",
      "ensureConversation",
    ]),
    ...mapActions("guilds", ["ensureGuild"]),
    ...mapActions("members", [
      "ensureMemberById",
      "ensurePlayersOfQuest",
      "ensureMembersOfGuild",
    ]),
    ...mapActions("quests", ["ensureQuest"]),
    ...mapActions("role", ["ensureAllRoles"]),
  },
  computed: {
    ...mapState("conversation", ["neighbourhood", "conversation"]),
    ...mapGetters({
      canEditConversation: "conversation/canEdit",
      canEditChannel: "channel/canEdit",
    }),
    ...mapGetters("channel", ["getChannelConversationTree", "getChannelNode"]),
    ...mapGetters("conversation", [
      "getConversationNodeById",
      "canMakeMeta",
      "getChildrenOf",
      "getRootNode",
      "getConversationTree",
      "getNeighbourhoodTree",
      "getThreatMap",
      "getScoreMap",
      "getTreeSequence",
      "getPrivateThreatMap",
      "getPrivateScoreMap",
      "getPrivateConversationTree",
    ]),
    ...mapGetters("guilds", ["getGuildById", "getCurrentGuild"]),
    ...mapGetters("quests", [
      "getMaxPubStateForNodeType",
      "getCurrentQuest",
      "getCurrentGamePlay",
    ]),
    ...mapGetters("members", ["getMemberById"]),
    ...mapGetters("role", ["getRoles"]),
    searchFilter_: function () {
      return this.searchFilter + "_";
    },
    nodeMap: function (): ConversationMap {
      if (this.channelId) return this.getChannelById(this.channelId);
      if (this.showFocusNeighbourhood) return this.neighbourhood;
      if (this.currentGuildId) return this.conversation;
      const entries: [string, ConversationNode][] = Object.entries(
        this.conversation
      );
      return Object.fromEntries(
        entries.filter(([id, node]) => node.status == "published")
      );
    },
    nodesTree: function (): QTreeNode[] {
      if (this.channelId)
        return this.getChannelConversationTree(this.channelId);
      if (this.showFocusNeighbourhood) return this.getNeighbourhoodTree;
      if (this.currentGuildId) return this.getPrivateConversationTree;
      return this.getConversationTree;
    },
    threats: function (): ThreatMap {
      if (this.channelId) return null;
      if (this.currentGuildId && this.showDraft)
        return this.getPrivateThreatMap;
      return this.getThreatMap;
    },
    scores: function (): ScoreMap {
      if (this.channelId) return null;
      if (this.currentGuildId && this.showDraft) return this.getPrivateScoreMap;
      return this.getScoreMap;
    },
  },
  watch: {
    currentGuildId: "guildChanged",
    conversation: "conversationChanged",
  },
})
export default class NodeTree extends NodeTreeProps {
  selectedNodeId: number = null;
  editingNodeId: number = null;
  addingChildToNodeId: number = null;
  selectedIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
  childIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
  newNode: Partial<ConversationNode> = {};
  allowChangeMeta = false;
  baseNodePubStateConstraints: publication_state_type[];
  showMeta = true;
  showObsolete = false;
  showDraft = true;
  showFocusNeighbourhood = false;
  searchFilter = "";
  ready = false;
  listenerInstalled = false;

  searchFilter_!: string;
  threats!: ThreatMap;
  scores!: ScoreMap;
  nodesTree!: QTreeNode[];
  getChannelConversationTree: ChannelGetterTypes["getChannelConversationTree"];
  getPrivateConversationTree: ConversationGetterTypes["getPrivateConversationTree"];
  canEditChannel: ChannelGetterTypes["canEdit"];
  getChannelNode: ChannelGetterTypes["getChannelNode"];
  canEditConversation: ConversationGetterTypes["canEdit"];
  getConversationNodeById: ConversationGetterTypes["getConversationNodeById"];
  getRootNode: ConversationGetterTypes["getRootNode"];
  canMakeMeta: ConversationGetterTypes["canMakeMeta"];
  getChildrenOf: ConversationGetterTypes["getChildrenOf"];
  getThreatMap!: ConversationGetterTypes["getThreatMap"];
  getPrivateThreatMap!: ConversationGetterTypes["getPrivateThreatMap"];
  getScoreMap!: ConversationGetterTypes["getScoreMap"];
  getPrivateScoreMap!: ConversationGetterTypes["getPrivateScoreMap"];
  getConversationTree!: ConversationGetterTypes["getConversationTree"];
  getNeighbourhoodTree!: ConversationGetterTypes["getNeighbourhoodTree"];
  getGuildById: GuildsGetterTypes["getGuildById"];
  getCurrentGulid: GuildsGetterTypes["getCurrentGuild"];
  getMemberById!: MembersGetterTypes["getMemberById"];
  getMaxPubStateForNodeType: QuestsGetterTypes["getMaxPubStateForNodeType"];
  getCurrentQuest: QuestsGetterTypes["getCurrentQuest"];
  getCurrentGamePlay!: QuestsGetterTypes["getCurrentGamePlay"];
  getRoles!: RoleGetterTypes["getRoles"];
  getTreeSequence!: ConversationGetterTypes["getTreeSequence"];
  nodeMap!: ConversationMap;

  createChannelNode: ChannelActionTypes["createChannelNode"];
  updateChannelNode: ChannelActionTypes["updateChannelNode"];
  ensureChannelConversation: ChannelActionTypes["ensureChannelConversation"];
  createConversationNode: ConversationActionTypes["createConversationNode"];
  updateConversationNode: ConversationActionTypes["updateConversationNode"];
  ensureConversationNeighbourhood!: ConversationActionTypes["ensureConversationNeighbourhood"];
  ensureConversation!: ConversationActionTypes["ensureConversation"];
  ensureRootNode: ConversationActionTypes["ensureRootNode"];
  ensureGuild: GuildsActionTypes["ensureGuild"];
  ensureMemberById: MembersActionTypes["ensureMemberById"];
  ensurePlayersOfQuest!: MembersActionTypes["ensurePlayersOfQuest"];
  ensureMembersOfGuild!: MembersActionTypes["ensureMembersOfGuild"];
  ensureQuest: QuestsActionTypes["ensureQuest"];
  ensureAllRoles: RoleActionTypes["ensureAllRoles"];

  emits = ["tree-selection"];

  calcPublicationConstraints(node: Partial<ConversationNode>) {
    if (!this.currentGuildId) {
      this.baseNodePubStateConstraints = [
        publication_state_enum.private_draft,
        publication_state_enum.published,
      ];
      return;
    }
    // a node publication state must be <= its parent's and >= all its children
    const pub_states = [...publication_state_list];
    if (!node) return [];
    if (node.parent_id) {
      const parent = this.getNode(node.parent_id);
      if (parent) {
        const pos = pub_states.indexOf(parent.status);
        if (pos >= 0) {
          pub_states.splice(pos + 1);
        }
      }
    }
    if (node.id) {
      const children_status = this.getChildrenOf(node.id).map((n) => n.status);
      if (children_status.length > 0) {
        children_status.sort(
          (a, b) =>
            publication_state_list.indexOf(a) -
            publication_state_list.indexOf(b)
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
    this.baseNodePubStateConstraints = pub_states;
  }

  getMemberHandle(id: number) {
    const member = this.getMemberById(id);
    if (member) {
      if (this.getCurrentQuest && !this.channelId) {
        const castings = this.getCurrentQuest.casting || [];
        const guild_id = castings.find((c) => c.member_id == id)?.guild_id;
        if (guild_id) {
          const guild = this.getGuildById(guild_id);
          return `${member.handle} of ${guild?.name}`;
        }
      }
      return member.handle;
    }
    return "";
  }

  calcSpecificPubConstraints(node: Partial<ConversationNode>) {
    if (node.meta == "channel" || !this.currentGuildId)
      return this.baseNodePubStateConstraints;
    const pub_states = [...this.baseNodePubStateConstraints];
    if (node.meta == "meta") {
      // clamp to guild
      const pos = pub_states.indexOf("proposed");
      if (pos >= 0) pub_states.splice(pos);
    }
    const node_type = node.node_type;
    if (node_type && node.quest_id) {
      const max_state = this.getMaxPubStateForNodeType(
        node.quest_id,
        node_type
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

  filterMethod(node: Partial<ConversationNode>, filter_string: string) {
    if (!this.showObsolete && node.status == "obsolete") return false;
    if (!this.showMeta && node.meta == "meta") return false;
    if (!this.showDraft && node.status != "published") return false;
    if (filter_string.length > 1) {
      const search_string = this.searchFilter.toLowerCase();
      if (
        node.title.toLowerCase().indexOf(search_string) < 0 &&
        (node.description || "").toLowerCase().indexOf(search_string) < 0
      )
        return false;
    }
    return true;
  }

  canEdit(nodeId: number): boolean {
    const quest = this.getCurrentQuest;
    if (!quest.is_playing || quest.status == "finished") return false;
    if (this.channelId) {
      return this.canEditChannel(this.channelId, nodeId);
    } else {
      return this.canEditConversation(nodeId);
    }
  }
  canAddTo(nodeId: number): boolean {
    const quest = this.getCurrentQuest;
    return (quest.is_playing || quest.is_quest_member) && quest.status != "finished";
  }
  getNode(nodeId: number): ConversationNode {
    if (this.channelId) {
      return this.getChannelNode(this.channelId, nodeId);
    } else {
      return this.getConversationNodeById(nodeId);
    }
  }

  editNode(nodeId: number) {
    const selectedNode = this.getNode(nodeId);
    this.newNode = {
      ...selectedNode,
    };
    this.addingChildToNodeId = null;
    if (selectedNode.parent_id) {
      const parent = this.getNode(selectedNode.parent_id);
      this.selectedIbisTypes = ibis_child_types(parent.node_type);
      this.allowChangeMeta =
        parent.meta == "conversation" && this.canMakeMeta(nodeId);
    } else {
      this.selectedIbisTypes = ibis_node_type_list;
      this.allowChangeMeta = false;
    }
    this.calcPublicationConstraints(selectedNode);
    this.editingNodeId = nodeId;
    const refs = this.$refs;
    setTimeout(() => {
      const form = refs[`editForm_${nodeId}`] as NodeForm;
      if (form) form.setFocus();
    }, 0);
  }
  addChildToNode(nodeId: number) {
    this.editingNodeId = null;
    const parent = this.getNode(nodeId);
    const parent_ibis_type = parent.node_type;
    this.childIbisTypes = ibis_child_types(parent_ibis_type);
    this.allowChangeMeta = parent.meta === "conversation";
    this.newNode = {
      status: "private_draft",
      node_type: this.childIbisTypes[0],
      parent_id: nodeId,
      quest_id: parent.quest_id,
      guild_id: parent.guild_id,
      meta: parent.meta,
    };
    this.calcPublicationConstraints(this.newNode);
    this.addingChildToNodeId = nodeId;
    const refs = this.$refs;
    setTimeout(() => {
      const form = refs[`addChildForm_${nodeId}`] as NodeForm;
      if (form) form.setFocus();
    }, 0);
  }
  cancel() {
    this.editingNodeId = null;
    this.addingChildToNodeId = null;
    this.newNode = {};
  }
  toggleDisplay(nodeId: number) {
    // TODO
  }
  selectedNode(copy?: boolean) {
    let node = this.getNode(this.selectedNodeId);
    if (copy) {
      node = { ...node };
    }
    return node;
  }
  async confirmAddChild(node) {
    // const parent = this.getNode(this.addingChildToNodeId);
    try {
      if (this.channelId) {
        await this.createChannelNode({ data: node });
      } else {
        await this.createConversationNode({ data: node });
      }
      this.addingChildToNodeId = null;
      this.newNode = {};
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
  async confirmEdit(node) {
    try {
      if (this.channelId) {
        await this.updateChannelNode({ data: node });
      } else {
        await this.updateConversationNode({ data: node });
      }
      this.editingNodeId = null;
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
  selectionChanged(id) {
    this.selectedNodeId = id;
    this.$emit("tree-selection", id);
  }
  async changeNeighbourhood() {
    this.ready = false;
    await this.treePromise();
    this.ready = true;
  }
  async treePromise() {
    if (this.showFocusNeighbourhood) {
      let node_id = this.getCurrentGamePlay?.focus_node_id;
      if (!node_id) {
        await this.ensureRootNode(this.currentQuestId);
        node_id = this.getRootNode?.id;
      }
      if (!this.initialSelectedNodeId) this.selectedNodeId = node_id;
      return await this.ensureConversationNeighbourhood({
        node_id,
        guild: this.currentGuildId,
      });
    }
    if (this.channelId) {
      return await this.ensureChannelConversation({
        channel_id: this.channelId,
        guild: this.currentGuildId,
      });
    }
    return await this.ensureConversation(this.currentQuestId);
  }

  async guildChanged() {
    // TODO. Force reload of tree
  }

  async conversationChanged(after, before) {
    const before_ids = new Set(Object.keys(before));
    const added_ids = [...Object.keys(after)].filter(
      (id) => !before_ids.has(id)
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

  keyResponder(evt) {
    if (!(this.selectedNodeId || this.addingChildToNodeId)) return;
    const qtree = this.$refs.tree as QTree;
    if (!qtree) return;
    const nodeName = evt.target.nodeName;
    const inField = !(nodeName == "BODY" || nodeName == "DIV");
    if (this.editingNodeId || this.addingChildToNodeId) {
      if (evt.key == "Escape" || (evt.key == "Enter" && nodeName == "BODY")) {
        this.editingNodeId = null;
        this.addingChildToNodeId = null;
        evt.preventDefault();
      }
      return;
    }
    if (inField) return;
    switch (evt.key) {
      case "ArrowUp":
        if (this.selectPrevious()) evt.preventDefault();
        break;
      case "ArrowDown":
        if (this.selectNext()) evt.preventDefault();
        break;
      case "ArrowLeft":
        qtree.setExpanded(this.selectedNodeId, false);
        evt.preventDefault();
        break;
      case "ArrowRight":
        qtree.setExpanded(this.selectedNodeId, true);
        evt.preventDefault();
        break;
      case "Enter":
        if (
          this.editable &&
          this.canEdit(this.selectedNodeId) &&
          !this.editingNodeId &&
          !this.addingChildToNodeId
        ) {
          this.editNode(this.selectedNodeId);
          evt.preventDefault();
        }
        break;
      case "+":
        if (this.editable && !this.editingNodeId && !this.addingChildToNodeId) {
          this.addChildToNode(this.selectedNodeId);
          evt.preventDefault();
        }
    }
  }

  hiddenByCollapse(qnode: QTreeNode) {
    const qtree = this.$refs.tree as QTree;
    while (qnode) {
      qnode = qnode.parent;
      if (!qnode) break;
      if (!qtree.isExpanded(qnode.id)) return true;
    }
    return false;
  }

  inSearchFilter(qnode: QTreeNode) {
    // assume searchFilter not empty
    if (this.filterMethod(qnode, this.searchFilter_)) return true;
    for (const child of qnode.children || []) {
      if (this.inSearchFilter(child)) return true;
    }
    return false;
  }

  scrollToNode(id, later = null) {
    if (later !== null) {
      setTimeout(() => this.scrollToNode(id, null), later);
    } else {
      const vnode = this.$refs["node_" + id] as Element;
      if (vnode) vnode.scrollIntoView({ block: "center" });
    }
  }

  selectPrevious() {
    const qtree = this.$refs.tree as QTree;
    const sequence = this.getTreeSequence;
    let pos = sequence.indexOf(this.selectedNodeId) - 1;
    while (pos >= 0) {
      const node_id = sequence[pos--];
      const qnode = qtree.getNodeByKey(node_id) as QTreeNode;
      if (
        qnode &&
        this.filterMethod(qnode, "") &&
        !this.hiddenByCollapse(qnode)
      ) {
        if (this.searchFilter.length > 0 && !this.inSearchFilter(qnode)) {
          continue;
        }
        this.selectionChanged(qnode.id);
        this.scrollToNode(qnode.id, 10);
        return true;
      }
    }
  }

  selectNext() {
    const qtree = this.$refs.tree as QTree;
    const sequence = this.getTreeSequence;
    let pos = sequence.indexOf(this.selectedNodeId) + 1;
    while (pos < sequence.length) {
      const node_id = sequence[pos++];
      const qnode = qtree.getNodeByKey(node_id) as QTreeNode;
      if (
        qnode &&
        this.filterMethod(qnode, "") &&
        !this.hiddenByCollapse(qnode)
      ) {
        if (this.searchFilter.length > 0 && !this.inSearchFilter(qnode)) {
          continue;
        }
        this.selectionChanged(qnode.id);
        this.scrollToNode(qnode.id, 10);
        return true;
      }
    }
  }

  beforeUnmount() {
    if (this.listenerInstalled)
      document.removeEventListener("keyup", this.keyResponder);
  }

  async beforeMount() {
    if (!this.listenerInstalled) {
      document.addEventListener("keyup", this.keyResponder);
      this.listenerInstalled = true;
    }
    this.selectedNodeId = this.initialSelectedNodeId;
    let promises = [this.ensureAllRoles()];
    if (this.currentGuildId) {
      this.showDraft = true;
      if (!this.channelId) this.showFocusNeighbourhood = true;
    }
    if (this.currentQuestId) {
      promises = [
        ...promises,
        this.ensureQuest({ quest_id: this.currentQuestId }),
        this.ensurePlayersOfQuest({ questId: this.currentQuestId }),
      ];
    }
    if (this.currentGuildId) {
      promises = [
        ...promises,
        this.ensureGuild({ guild_id: this.currentGuildId }),
        this.ensureMembersOfGuild({ guildId: this.currentGuildId }),
      ];
    }
    await Promise.all(promises);
    promises = [this.treePromise()];
    if (this.currentQuestId)
      promises.push(
        this.ensureMemberById({ id: this.getCurrentQuest.creator })
      );
    await Promise.all(promises);
    this.scrollToNode(this.selectedNodeId, 100);
    this.ready = true;
  }
}
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
