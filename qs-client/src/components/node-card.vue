<template>
  <div class="col-12 col-md q-pa-md">
    <q-card id="node-card">
      <section id="node-card-title">
        <h5 class="q-ma-md">
          <IbisButton v-bind:node_type="node.node_type"></IbisButton>
          {{ node.title }}
        </h5>
      </section>
      <section>
        <div>
          <p id="node-card-detail-header">Details<br /></p>
        </div>
        <div v-html="node.description" id="node-card-details"></div>
      </section>
    </q-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import IbisButton from "./ibis-btn.vue";
import { ConversationNode } from "../types";

import { Prop } from "vue/types/options";

const NodeCardProps = Vue.extend({
  props: {
    node: Object as Prop<ConversationNode>,
  },
});

@Component<NodeCard>({
  name: "NodeCard",
  components: { IbisButton },
  computed: {
    description() {
      return this.node.description || "";
    },
  },
})
export default class NodeCard extends NodeCardProps {}
</script>
<style>
#node-card {
  text-align: center;
  border: 2px solid black;
  font-size: 1em;
  color: rgb(39, 11, 194);
  background-color: rgb(158, 181, 243);
}
#node-card-details {
  background-color: rgb(158, 181, 243);
  color: rgb(39, 11, 194);
  text-align: left;
  font-size: 1em;
  padding-top: 3%;
  padding-left: 1%;
  border: 1px solid gray;
}
#node-card-title {
  border: 1px solid gray;
  background-color: lightgray;
  color: rgb(39, 11, 194);
}
#node-card-data {
  text-align: left;
  font-size: 1em;
  background-color: rgb(158, 181, 243);
  color: rgb(39, 11, 194);
}
#node-card-detail-header {
  text-align: center;
  background-color: rgb(158, 181, 243);
  color: black;
  margin-bottom: 0%;
}
</style>
