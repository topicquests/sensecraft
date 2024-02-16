<template>
  <div>
    <q-card v-if="QuestCardProps.currentQuest" class="quest_card">
      <q-card-section class="q-pb-none">
        <q-avatar size="45px" class="q-ma-sm">
          <img :src="conversationStore.ibis_node_icon('quest', false)" />
        </q-avatar>
        <div class="row justify-center">
          <h3 class="q-mt-md">
            {{ QuestCardProps.currentQuest.name }}
          </h3>
          <q-btn
            class="q-ml-xs q-mt-md"
            size="md"
            :flat="true"
            icon="info"
            v-if="QuestCardProps.currentQuest.description"
          >
            <q-tooltip self="bottom middle" max-width="25rem">
              <div v-html="QuestCardProps.currentQuest.description"></div>
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
            v-if="QuestCardProps.currentQuest.casting && QuestCardProps.currentQuest.casting.length"
            class="quest-card-data"
          >
            Players: {{ QuestCardProps.currentQuest.casting.length }}
          </p>
          <p v-else class="quest-card-data">Players: 0</p>
          <p
            v-if="QuestCardProps.currentQuest.game_play && QuestCardProps.currentQuest.game_play.length"
            class="quest-card-data"
          >
            Guilds: {{ QuestCardProps.currentQuest.game_play.length }}
          </p>
          <p v-else class="quest-card-data">Guilds: 0</p>
          <p
            v-if="conversationStore.getNeighbourhood && conversationStore.getNeighbourhood.length"
            class="quest-card-data"
          >
            Moves: {{ conversationStore.getNeighbourhood.length - 1 }}
          </p>
          <p v-else class="quest-card-data">Moves: 0</p>

          <p class="quest-card-data">Status: {{ QuestCardProps.currentQuest.status }}</p>
        </div>

        <div class="col-6">
          <p class="quest-card-data">
            Start Date: {{ getDate(QuestCardProps.currentQuest.start) }}
          </p>
          <p class="quest-card-data">
            End Date: {{ getDate(QuestCardProps.currentQuest.end) }}
          </p>
          <p class="quest-card-data">Last Activity: {{ getLastActivity() }}</p>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { QuestData, Member, ConversationNode } from "../types";
import { useConversationStore, ibis_node_icon } from "src/stores/conversation";

const QuestCardProps = defineProps<{
    currentQuest: QuestData;
    creator: object;
    showQuestInfo:  {
      type: boolean,
      default: true,
    },
}>();
const conversationStore = useConversationStore();

function getDate(dte: string) {
  if (dte) {
    let date: Date = new Date(dte);
    let formattedDate: string = new Intl.DateTimeFormat("en-US").format(date);
    return formattedDate;
  }
};
  function getLastActivity() {
    let date: Date = new Date();
    let newestDate;
    var dateArray: ConversationNode[] = [];
    const neighbourhood: ConversationNode[] = conversationStore.getNeighbourhood;
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
