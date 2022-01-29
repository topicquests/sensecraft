<template>
  <div>
    <q-card v-if="currentQuestCard" id="quest_card" style="width: 80%">
      <section class="quest-card-title">
        <q-avatar size="56px" class="q-ma-sm">
          <img :src="ibis_node_icon('quest', true)" />
        </q-avatar>
        <q-tooltip
          self="bottom middle"
          max-width="25rem"
          style="background-color: white"
        >
          <div
            class="col-4 q-mb-xl"
            v-html="currentQuestCard.description"
          ></div>
        </q-tooltip>
        <h5 class="q-ma-md">
          {{ currentQuestCard.name }}
        </h5>
      </section>
      <section>
        <div class="row">
          <div class="col-6">
            <p class="q-pt-sm q-ml-md q-mb-sm quest-card-data">
              Players: {{ currentQuestCard.casting.length }}
            </p>
          </div>
          <div class="col-6">
            <p class="q-pt-sm q-ml-md q-mb-sm quest-card-data">
              Start Date: {{ getStartDate }}
            </p>
          </div>
        </div>
        <div class="row">
          <div class="col-6">
            <p class="q-pt-sm q-ml-md q-mb-sm quest-card-data">
              Guilds: {{ currentQuestCard.game_play.length }}
            </p>
          </div>
          <div class="col-6">
            <p class="q-pt-sm q-ml-md q-mb-sm quest-card-data">
              End Date: {{ getEndDate }}
            </p>
          </div>
        </div>
        <div class="row">
          <div class="col-6">
            <p class="q-pt-sm q-ml-md q-mb-sm quest-card-data">
              Moves: {{ currentQuestCard.casting.length }}
            </p>
          </div>
          <div class="col-6">
            <p class="q-pt-sm q-ml-md q-mb-sm quest-card-data">
              Last Activity: {{ getStartDate }}
            </p>
          </div>
        </div>
        <section class="quest-card-data"></section>
      </section>
    </q-card>
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
  computed: {
    getStartDate() {
      if (this.currentQuestCard.start) {
        let date = new Date(this.currentQuestCard.start);
        let startDate = new Intl.DateTimeFormat("en-US").format(date);
        return startDate;
      }
    },
    getEndDate() {
      if (this.currentQuestCard.end) {
        let date = new Date(this.currentQuestCard.end);
        let endDate = new Intl.DateTimeFormat("en-US").format(date);
        return endDate;
      }
    },
  },
  methods: {
    ibis_node_icon,
  },
})
export default class QuestCard extends QuestCardProps {}
</script>
<style>
#quest_card {
  text-align: center;
  font-size: 1em;
}
#quest-card-title {
  border: black;
}
#quest-card-details {
  text-align: left;
  font-size: 1.2em;
  padding-top: 3%;
  padding-left: 1%;
}

.quest-card-data {
  text-align: left;
  font-size: 1em;
  background-color: white;
}
</style>
