<template>
  <div>
    <q-card v-if="currentQuestCard" class="quest_card" style="width: 100%">
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
        <q-card-section class="row">
          <div class="col"></div>
          <div v-if="currentQuestCard.casting" class="col-6">
            <p class="quest-card-data">
              Players: {{ currentQuestCard.casting.length }}
            </p>
            <p v-if="currentQuestCard.game_play.length" class="quest-card-data">
              Guilds: {{ currentQuestCard.game_play.length }}
            </p>
            <p v-else class="quest-card-data">Guilds: 0</p>
            <p class="quest-card-data">
              Moves: {{ getNeighbourhood.length - 1 }}
            </p>
            <p class="quest-card-data">Status: {{ currentQuestCard.status }}</p>
          </div>

          <div class="col-6">
            <p class="quest-card-data">
              Start Date: {{ getDate(currentQuestCard.start) }}
            </p>
            <p class="quest-card-data">
              End Date: {{ getDate(currentQuestCard.end) }}
            </p>
            <p class="quest-card-data">
              Last Activity: {{ getLastActivity() }}
            </p>
          </div>
        </q-card-section>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Quest, Member, ConversationNode } from "../types";
import { mapGetters } from "vuex";
import { Prop } from "vue/types/options";
import { ConversationGetterTypes, ibis_node_icon } from "../store/conversation";
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
  },
  methods: {
    ibis_node_icon,
  },
})
export default class QuestCard extends QuestCardProps {
  getCurrentQuest!: QuestsGetterTypes["getCurrentQuest"];
  getNeighbourhood!: ConversationGetterTypes["getNeighbourhood"];

  getDate(dte: string) {
    if (dte) {
      let date: Date = new Date(dte);
      let formattedDate: String = new Intl.DateTimeFormat("en-US").format(date);
      return formattedDate;
    }
  }

  getLastActivity() {
    let date: Date = new Date();
    let publishedNeighbourhood: ConversationNode[];
    let newestDate;
    const neighbourhood: ConversationNode[] = this.getNeighbourhood;
    if (neighbourhood.length) {
      publishedNeighbourhood = neighbourhood.map((pub) => {
        if (pub.status == "published") {
          date = new Date(pub.updated_at);
          pub.updated_at = new Intl.DateTimeFormat("en-US").format(date);
          return pub;
        }
      });
      newestDate = publishedNeighbourhood.reduce((a, b) => {
        return new Date(a.updated_at) > new Date(b.updated_at) ? a : b;
      });
      if (newestDate) {
        return newestDate.updated_at;
      }
    }
  }
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
