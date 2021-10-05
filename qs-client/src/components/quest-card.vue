<template>
  <div>
    <div class="col-4 q-pa-lg">
      <q-card v-if="currentQuestCard" class="quest_card">
        <section id="quest-card-title">
          <q-avatar size="56px" class="q-ma-sm">
            <img :src="ibis_node_icon('quest', true)" />
          </q-avatar>
          <h5 class="q-ma-md">
            {{ currentQuestCard.name }}
          </h5>
        </section>
        <section id="quest-card-details">
          <div v-html="currentQuestCard.description" class="q-mb-xl"></div>
        </section>
        <section class="quest-card-data">
          <p class="q-ml-md q-pb-none q-mb-sm q-pt-xl quest-card-data">
            Quest Creator: {{ creator.handle }}
          </p>
          <p class="q-pt-none q-ml-md q-mb-sm quest-card-data">
            Quest Handle: {{ currentQuestCard.handle }}
          </p>
          <p class="q-pt-sm q-ml-md quest-card-data">
            Start Date: {{ currentQuestCard.start }}
          </p>
        </section>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Quest, Member } from "../types";
import { Prop } from "vue/types/options";
import { ibis_node_icon } from "../store/conversation";

const QuestCardProps = Vue.extend({
  props: {
    currentQuestCard: Object as Prop<Quest>,
    creator: Object as Prop<Member>,
  },
});

@Component<QuestCard>({
  name: "questCard",
  methods: {
    ibis_node_icon,
  },
})
export default class QuestCard extends QuestCardProps {}
</script>
<style>
.quest_card {
  text-align: center;
  border: 2px solid black;
  font-size: 1em;
  color: darkgreen;
  background-color: aquamarine;
}
#quest-card-details {
  background-color: aquamarine;
  text-align: left;
  font-size: 1.2em;
  padding-top: 3%;
  padding-left: 1%;
  border: 1px solid gray;
}
#quest-card-title {
  border: 1px solid gray;
  background-color: lightgray;
}
.quest-card-data {
  text-align: left;
  font-size: 1em;
  background-color: aquamarine;
}
</style>
