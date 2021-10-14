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
const NeighbourhoodTreeProps = Vue.extend({
  props: {
    neighbourhoodNodes: Object as Prop<Object>,
  },
});
@Component<NeighbourhoodTree>({
  name: "NeighbourhoodTree",
  computed: {},
  watch: {
    selectedNodeId: "selectionChanged",
    neighbourhoodNodes(newNeighborhood: Object) {
      this.neighbourhood = newNeighborhood;
    },
  },
})
export default class NeighbourhoodTree extends NeighbourhoodTreeProps {
  neighbourhood: Object = {};
  selectedNodeId: number = null;
  selected: string;
  selectionChanged() {
    this.$emit("updateTree", this.selectedNodeId);
  }
}
</script>
