<template>
<div class="tree-container">
  <div class="row justify-end">
    <q-btn
      icon="menu"
      :flat="true"
      :dense="true"
      >
      <q-menu>
        <q-list>
          <q-item>
            <q-input
              label="Search"
              type="text"
              v-model="searchFilter"
              ></q-input>
          </q-item>
          <q-item>
            <q-checkbox v-model="showDraft" label="Draft nodes" :dense="true" v-if="!asQuest"></q-checkbox>
          </q-item>
          <q-item>
            <q-checkbox v-model="showMeta" label="Meta nodes" :dense="true" v-if="!asQuest"></q-checkbox>
          </q-item>
          <q-item>
            <q-checkbox v-model="showObsolete" :dense="true" label="Obsolete nodes"></q-checkbox>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
  <q-tree
    :nodes="nodes"
    node-key="id"
    label-key="title"
    default-expand-all
    :selected.sync="selectedNodeId"
    :filter-method="filterMethod"
    :filter="searchFilter_"
  >
    <template v-slot:default-header="prop">
      <div class="row items-center">
        <q-icon :name="prop.node.icon" class="q-mr-sm" />
        <span
          v-if="scores && scores[prop.node.id]"
          :class="
            'score' +
            (currentGuild == prop.node.guild_id
              ? ' my-score'
              : ' other-score') +
            (scores[prop.node.id] < 0 ? ' score-neg' : ' score-pos')
          "
        >
          {{ scores[prop.node.id] }}&nbsp;
        </span>
        <div
          :class="
            'node-status-' + prop.node.status + ' node-meta-' + prop.node.meta
          "
        >
          {{ prop.node.label  }} - {{getMemberById(prop.node.creator_id).handle}}
        </div>
        <span class="threat" v-if="threats && threats[prop.node.id]"
          >&nbsp;[{{ threats[prop.node.id] }}]</span
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
          v-if="editable && !editingNodeId && !addingChildToNodeId"
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
        <div class="node-description" v-html="prop.node.description"></div>
      </div>
      <node-form
        v-if="editable && prop.node.id == editingNodeId"
        :nodeInput="selectedNode(true)"
        :allowAddChild="false"
        :ibisTypes="selectedIbisTypes"
        :editing="true"
        :roles="roles"
        :allowChangeMeta="allowChangeMeta"
        :pubFn="calcSpecificPubConstraints"
        v-on:action="confirmEdit"
        v-on:cancel="cancel"
      />
      <node-form
        v-if="editable && prop.node.id == addingChildToNodeId"
        :nodeInput="newNode"
        :allowAddChild="false"
        :ibisTypes="childIbisTypes"
        :editing="true"
        :roles="roles"
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
import { Prop } from "vue/types/options";
import { ConversationNode, Role, QTreeNode } from "../types";
import NodeForm from "./node-form.vue";
import {
  ConversationState,
  ConversationGetterTypes,
  ConversationActionTypes,
  ibis_child_types,
} from "../store/conversation";
import {
  QuestsState,
  QuestsGetterTypes,
  QuestsActionTypes,
} from "../store/quests";
import {
  ibis_node_type_type,
  ibis_node_type_list,
  publication_state_enum,
  publication_state_type,
  publication_state_list,
} from "../enums";
import {
  ChannelState,
  ChannelGetterTypes,
  ChannelActionTypes,
} from "../store/channel";
import { ThreatMap, ScoreMap } from "../scoring";
import { MembersGetterTypes, MembersActionTypes } from '../store/members'

class NodeTreeBase {}

const NodeTreeProps = Vue.extend({
  props: {
    nodes: Array as Prop<QTreeNode[]>,
    threats: Object as Prop<ThreatMap>,
    scores: Object as Prop<ScoreMap>,
    currentGuild: Number || null,
    channelId: Number || null,
    editable: Boolean,
    hideDescription: Boolean,
    asQuest: Boolean,
    roles: Array as Prop<Role[]>,
  },
});

@Component<NodeTree>({
  components: { NodeForm },
  name: "ConversationNodeTree",
  methods: {
    ...mapActions("conversation", [
      "createConversationNode",
      "updateConversationNode",
    ]),
    ...mapActions("channel", ["createChannelNode", "updateChannelNode"]),
    ...mapActions('members', ['ensureAllMembers'])
  },
  computed: {
    ...mapGetters({
      canEditConversation: "conversation/canEdit",
      canEditChannel: "channel/canEdit",
    }),
    ...mapGetters("conversation", [
      "getConversationNodeById",
      "canMakeMeta",
      "getChildrenOf",
    ]),
    ...mapGetters("channel", ["getChannelNode"]),
    ...mapGetters("quests", ["getMaxPubStateForNodeType"]),
    ...mapGetters('members', ['getMemberById']),
    searchFilter_: function() { return this.searchFilter+"_" },
  },
  watch: {
    selectedNodeId: "selectionChanged",
  },
})
export default class NodeTree extends NodeTreeProps {
  selectedNodeId: number = null;
  editingNodeId: number = null;
  addingChildToNodeId: number = null;
  selectedIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
  childIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
  newNode: Partial<ConversationNode> = {};
  allowChangeMeta: boolean = false;
  baseNodePubStateConstraints: publication_state_type[];
  showMeta: Boolean = true;
  showObsolete: Boolean = false;
  showDraft: Boolean = true;
  searchFilter = '';

  canEditConversation: ConversationGetterTypes["canEdit"];
  getConversationNodeById: ConversationGetterTypes["getConversationNodeById"];
  getMemberById!: MembersGetterTypes['getMemberById']
  createConversationNode: ConversationActionTypes["createConversationNode"];
  updateConversationNode: ConversationActionTypes["updateConversationNode"];
  canMakeMeta: ConversationGetterTypes["canMakeMeta"];
  canEditChannel: ChannelGetterTypes["canEdit"];
  getChannelNode: ChannelGetterTypes["getChannelNode"];
  createChannelNode: ChannelActionTypes["createChannelNode"];
  updateChannelNode: ChannelActionTypes["updateChannelNode"];
  getChildrenOf: ConversationGetterTypes["getChildrenOf"];
  getMaxPubStateForNodeType: QuestsGetterTypes["getMaxPubStateForNodeType"];

  ensureAllMembers!: MembersActionTypes['ensureAllMembers']

  calcPublicationConstraints(node: Partial<ConversationNode>) {
    if (this.asQuest) {
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

  calcSpecificPubConstraints(node: Partial<ConversationNode>) {
    if (node.meta == "channel" || this.asQuest)
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
    if (this.searchFilter != '') {
      const search_string = this.searchFilter.toLowerCase();
      if (node.title.toLowerCase().indexOf(search_string) < 0 &&
          (node.description || '').toLowerCase().indexOf(search_string) < 0
       ) return false;
    }
    return true;
  }

  canEdit(nodeId: number): boolean {
    if (this.channelId) {
      return this.canEditChannel(this.channelId, nodeId);
    } else {
      return this.canEditConversation(nodeId);
    }
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
  }
  addChildToNode(nodeId: number) {
    this.editingNodeId = null;
    const parent = this.getNode(nodeId);
    const parent_ibis_type = parent.node_type;
    this.childIbisTypes = ibis_child_types(parent_ibis_type);
    this.allowChangeMeta = parent.meta === "conversation";
    this.newNode = Object.assign(
      {
        status: "private_draft",
      },
      this.newNode,
      {
        node_type: this.childIbisTypes[0],
        parent_id: nodeId,
        quest_id: parent.quest_id,
        guild_id: parent.guild_id,
        meta: parent.meta,
      }
    );
    this.calcPublicationConstraints(this.newNode);
    this.addingChildToNodeId = nodeId;
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
    const parent = this.getNode(this.addingChildToNodeId);
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
  }
  async beforeMount() {
    if (this.asQuest)
      this.showDraft = true;
    // TODO: Maybe only those in the tree?
    await this.ensureAllMembers();
  }
}
</script>
<style>
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
.threat {
  color: grey;
}
</style>
