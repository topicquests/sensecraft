<template>
  <div class="col-12 col-md q-pa-md">
    <q-card id="node-card">
      <section id="node-card-title">
        <div class="row" style="text-align: left">
          <p class="q-ma-md">Node type</p>
          <btnQuestion></btnQuestion>
        </div>
        <h5 class="q-ma-md">
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
import btnQuestion from "./btn-question.vue";
export default {
  components: { btnQuestion },
  name: "node",
  props: {
    node: {
      type: Object,
    },
    nodeType: {
      type: String,
    },
  },
  data() {
    return {};
  },
};
</script>
<style>
#node-card {
  text-align: center;
  border: 3px solid black;
  font-size: 1.2em;
  color: rgb(39, 11, 194);
  background-color: rgb(158, 181, 243);
}
#node-card-details {
  background-color: rgb(158, 181, 243);
  color: rgb(39, 11, 194);
  text-align: left;
  font-size: 1.2em;
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
  font-size: 1.2em;
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
