<template>
  <div>
    <q-card v-if="currentQuest" class="quest_card">
      <q-card-section class="q-pb-none">
        <q-avatar size="45px" class="q-ma-sm">
          <img :src="ibis_node_icon('quest', false)" />
        </q-avatar>
        <div class="row justify-center">
          <h3 class="q-mt-md">
            {{ currentQuest.name }}
          </h3>
          <q-btn
            class="q-ml-xs q-mt-md"
            size="md"
            :flat="true"
            icon="info"
            v-if="currentQuest.description"
          >
            <q-tooltip self="bottom middle" max-width="25rem">
              <div v-html="currentQuest.description"></div>
            </q-tooltip>
          </q-btn>
          <router-link
            :to="{ name: 'quest_page', params: { quest_id: currentQuest.id } }"
            class="q-ml-sm q-mt-md"
            >Game</router-link
          >
        </div>
      </q-card-section>
      <q-separator color="black"></q-separator>

      <q-card-section v-if="showQuestInfo" class="row">
        <div class="col"></div>
        <div class="col-6">
          <p
            v-if="currentQuest.casting && currentQuest.casting.length"
            class="quest-card-data"
          >
            Players: {{ currentQuest.casting.length }}
          </p>
          <p v-else class="quest-card-data">Players: 0</p>
          <p
            v-if="currentQuest.game_play && currentQuest.game_play.length"
            class="quest-card-data"
          >
            Guilds: {{ currentQuest.game_play.length }}
          </p>
          <p v-else class="quest-card-data">Guilds: 0</p>
          <p
            v-if="getNeighbourhood && getNeighbourhood.length"
            class="quest-card-data"
          >
            Moves: {{ getNeighbourhood.length - 1 }}
          </p>
          <p v-else class="quest-card-data">Moves: 0</p>

          <p class="quest-card-data">Status: {{ currentQuest.status }}</p>
        </div>

        <div class="col-6">
          <p class="quest-card-data">
            Start Date: {{ getDate(currentQuest.start) }}
          </p>
          <p class="quest-card-data">
            End Date: {{ getDate(currentQuest.end) }}
          </p>
          <p class="quest-card-data">Last Activity: {{ getLastActivity() }}</p>
        </div>
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
import { QuestsGetterTypes } from "src/store/quests";

const QuestCardProps = Vue.extend({
  props: {
    currentQuest: Object as Prop<Quest>,
    creator: Object as Prop<Member>,
    showQuestInfo: {
      type: Boolean,
      default: true,
    },
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
  ibis_node_icon!: typeof ibis_node_icon;

  getDate(dte: string) {
    if (dte) {
      let date: Date = new Date(dte);
      let formattedDate: string = new Intl.DateTimeFormat("en-US").format(date);
      return formattedDate;
    }
  }

  countMoves(): number {
    const moves = this.getNeighbourhood.filter(
      (node: ConversationNode) => node.guild_id != null
    );
    return moves.length;
  }

  getLastActivity() {
    let date: Date = new Date();
    let newestDate;
    var dateArray: ConversationNode[] = [];
    const neighbourhood: ConversationNode[] = this.getNeighbourhood;
    if (neighbourhood.length) {
      neighbourhood.forEach((pub) => {
        if (pub.status == "published") {
          date = new Date(pub.updated_at);
          pub.updated_at = new Intl.DateTimeFormat("en-US").format(date);
          dateArray.push(pub);
        }
      });

      newestDate = dateArray.reduce((a, b) => {
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
