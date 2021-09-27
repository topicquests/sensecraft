<template>
  <div class="col-12 col-md q-pa-md">
    <q-card id="node-card">
      <section id="node-card-title">
        <q-avatar size="56px" class="q-ma-sm">
          <img src="../statics/images/question.png" />
        </q-avatar>
        <h5 class="q-ma-md">
          {{ nodeCard.title }}
        </h5>
      </section>
      <section id="node-card-details">
        Details<br />
        <div v-html="nodeCard.description"></div>
      </section>
    </q-card>
  </div>
</template>

<script lang="ts">
export default {
  name: "nodeCard",
  props: {
    nodeCard: {
      type: Object,
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
</style>
