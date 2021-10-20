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
        <div :class="'node-status-' + prop.node.data.status">
          {{ prop.node.label }}
        </div>
      </div>
    </template>
  </q-tree>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue/types/options";
import type { QTreeNode } from "../store/conversation";
const NodeTreeProps = Vue.extend({
  props: {
    nodes: Object as Prop<QTreeNode[]>,
  },
});
@Component<NodeTree>({
  name: "NodeTree",
  computed: {},
  watch: {
    selectedNodeId: "selectionChanged",
  },
})
export default class NodeTree extends NodeTreeProps {
  selectedNodeId: number = null;
  selected: string;
  selectionChanged() {
    this.$emit("updateTree", this.selectedNodeId);
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
</style>
