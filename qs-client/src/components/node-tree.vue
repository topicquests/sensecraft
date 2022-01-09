<template>
  <q-tree
    :nodes="nodes"
    node-key="id"
    :default-expand-all="true"
    :selected.sync="selectedNodeId"
  >
    <template v-slot:default-header="prop">
      <div class="row items-center">
        <q-icon :name="prop.node.icon" class="q-mr-sm" />
        <div
          :class="
            'node-status-' +
            prop.node.data.status +
            ' node-meta-' +
            prop.node.data.meta
          "
        >
          {{ prop.node.label }}
        </div>
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
        <div class="node-description" v-html="prop.node.data.description"></div>
      </div>
      <node-form
        v-if="editable && prop.node.id == editingNodeId"
        :nodeInput="selectedNode(true)"
        :allowAddChild="false"
        :ibisTypes="selectedIbisTypes"
        :editing="true"
        :roles="roles"
        :allowChangeMeta="allowChangeMeta"
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
        v-on:action="confirmAddChild"
        v-on:cancel="cancel"
      />
    </template>
  </q-tree>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters, mapActions, mapState } from "vuex";
import Component from "vue-class-component";
import { Prop } from "vue/types/options";
import { ConversationNode, Role } from "../types";
import NodeForm from "./node-form.vue";
import type { QTreeNode } from "../store/conversation";
import {
  ConversationState,
  ConversationGetterTypes,
  ConversationActionTypes,
  ibis_child_types,
} from "../store/conversation";
import { ibis_node_type_type, ibis_node_type_list } from "../enums";
import {
  ChannelState,
  ChannelGetterTypes,
  ChannelActionTypes,
} from "../store/channel";

class NodeTreeBase {}

const NodeTreeProps = Vue.extend({
  props: {
    nodes: Array as Prop<QTreeNode[]>,
    channelId: Number || null,
    editable: Boolean,
    hideDescription: Boolean,
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
  },
  computed: {
    ...mapGetters({
      canEditConversation: "conversation/canEdit",
      canEditChannel: "channel/canEdit",
    }),
    ...mapGetters("conversation", ["getConversationNodeById", "canMakeMeta"]),
    ...mapGetters("channel", ["getChannelNode"]),
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

  canEditConversation: ConversationGetterTypes["canEdit"];
  getConversationNodeById: ConversationGetterTypes["getConversationNodeById"];
  createConversationNode: ConversationActionTypes["createConversationNode"];
  updateConversationNode: ConversationActionTypes["updateConversationNode"];
  canMakeMeta: ConversationGetterTypes["canMakeMeta"];
  canEditChannel: ChannelGetterTypes["canEdit"];
  getChannelNode: ChannelGetterTypes["getChannelNode"];
  createChannelNode: ChannelActionTypes["createChannelNode"];
  updateChannelNode: ChannelActionTypes["updateChannelNode"];

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
    this.editingNodeId = nodeId;
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
  }
  addChildToNode(nodeId: number) {
    this.editingNodeId = null;
    this.addingChildToNodeId = nodeId;
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
</style>
