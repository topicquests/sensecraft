<template>
  <q-tree
    :nodes="neighbourhood"
    node-key="id"
    default-expand-all="true"
    :selected.sync="selectedNodeId"
  />
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue/types/options";
const NodeTreeProps = Vue.extend({
  props: {
    nodes: Object as Prop<Object>,
  },
});
@Component<NodeTree>({
  name: "NodeTree",
  computed: {},
  watch: {
    selectedNodeId: "selectionChanged",
    nodes(newNeighborhood: Object) {
      this.neighbourhood = newNeighborhood;
    },
  },
})
export default class NodeTree extends NodeTreeProps {
  neighbourhood: Object = {};
  selectedNodeId: number = null;
  selected: string;
  selectionChanged() {
    this.$emit("updateTree", this.selectedNodeId);
  }
}
</script>
