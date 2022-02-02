<template>
  <div>
    <q-card v-if="currentQuestCard" class="quest_card" style="width: 80%">
      <q-card-section class="q-pb-none">
        <q-avatar size="45px" class="q-ma-sm">
          <img :src="ibis_node_icon('quest')" />
        </q-avatar>
        <div class="row justify-center">
          <h5 class="q-mt-md">
            {{ currentQuestCard.name }}
          </h5>
          <q-btn class="q-ml-xs q-mt-md" size="md" :flat="true" icon="info" />

          <q-tooltip self="bottom middle" max-width="25rem">
            <div v-html="currentQuestCard.description"></div>
          </q-tooltip>
        </div>
      </q-card-section>
      <q-separator color="black"></q-separator>
      <q-card-section>
        <div class="row">
          <div class="col-6">
            <p class="q-pt-sm q-ml-md q-mb-sm quest-card-data">
              Players: {{ getCurrentQuest.casting.length }}
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
              Moves: {{ getNeighbourhood.length - 1 }}
            </p>
          </div>
          <div class="col-6">
            <p class="q-pt-sm q-ml-md q-mb-sm quest-card-data">
              Last Activity:
            </p>
          </div>
        </div>
        <div class="row">
          <div class="col-6">
            <p class="q-pt-sm q-ml-md q-mb-sm quest-card-data">
              Status: {{ currentQuestCard.status }}
            </p>
          </div>
        </div>
        <section class="quest-card-data"></section>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Quest, Member } from "../types";
import { mapGetters } from "vuex";
import { Prop } from "vue/types/options";
import { ibis_node_icon } from "../store/conversation";
import { guilds, GuildsGetterTypes } from "src/store/guilds";
import { QuestsGetterTypes } from "src/store/quests";

const QuestCardProps = Vue.extend({
  props: {
    currentQuestCard: Object as Prop<Quest>,
    creator: Object as Prop<Member>,
  },
});

@Component<QuestCard>({
  name: "questCard",
  computed: {
    ...mapGetters("conversation", ["getNeighbourhood"]),
    ...mapGetters("quests", ["getCurrentQuest"]),

    getStartDate() {
      if (this.currentQuestCard.start) {
        let date: Date = new Date(this.currentQuestCard.start);
        let startDate: String = new Intl.DateTimeFormat("en-US").format(date);
        return startDate;
      }
    },
    getEndDate() {
      if (this.currentQuestCard.end) {
        let date: Date = new Date(this.currentQuestCard.end);
        let endDate: String = new Intl.DateTimeFormat("en-US").format(date);
        return endDate;
      }
    },
  },
  methods: {
    ibis_node_icon,
  },
})
export default class QuestCard extends QuestCardProps {
  getCurrentQuest!: QuestsGetterTypes["getCurrentQuest"];
}
</script>
<style>
.quest_card {
  text-align: center;
  font-size: 1em;
  background-color: ivory;
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
  background-color: ivory;
}
</style>
