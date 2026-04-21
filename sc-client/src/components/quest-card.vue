<template>
  <div>
    <q-card v-if="QuestCardProps.currentQuest" class="quest_card">
      <q-card-section class="q-pb-none">
        <q-avatar size="45px" class="q-ma-sm">
          <img :src="ibis_node_icon('quest', false)" />
        </q-avatar>
        <div class="row justify-center">
          <h3 class="q-mt-md quest-card-title">
            {{ QuestCardProps.currentQuest.name }}
          </h3>
          <q-btn
            v-if="currentQuest.description"
            class="q-ml-xs"
            size="lg"
            :flat="true"
            icon="info"
            color="info"
            @click="showDialog = true"
          />
          <q-dialog v-model="showDialog" persistent>
            <q-card style="max-height: 1000px">
              <q-card-section>
                <div class="text-h6">Quest Information</div>
                <div>{{ currentQuest.name }}</div>
              </q-card-section>
              <q-card-section>
                <div v-html="currentQuest.description"></div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Close" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>
          <router-link
            v-if="currentQuest.id"
            :to="{ name: 'quest_page', params: { quest_id: currentQuest.id } }"
            class="q-ml-sm q-mt-md"
          >
            Game
          </router-link>
        </div>
      </q-card-section>
      <q-separator color="black"></q-separator>
      <q-card-section v-if="showQuestInfo" class="row">
        <div class="col"></div>
        <div class="col-6">
          <p
            v-if="
              QuestCardProps.currentQuest.casting &&
              QuestCardProps.currentQuest.casting.length
            "
            class="quest-card-data"
          >
            Players: {{ QuestCardProps.currentQuest.casting.length }}
          </p>
          <p v-else class="quest-card-data">Players: 0</p>
          <p
            v-if="
              QuestCardProps.currentQuest.game_play &&
              QuestCardProps.currentQuest.game_play.length
            "
            class="quest-card-data"
          >
            Guilds: {{ QuestCardProps.currentQuest.game_play.length }}
          </p>
          <p v-else class="quest-card-data">Guilds: 0</p>
          <p
            v-if="
              conversationStore.getNeighbourhood &&
              conversationStore.getNeighbourhood.length
            "
            class="quest-card-data"
          >
            Moves: {{ conversationStore.getNeighbourhood.length - 1 }}
          </p>
          <p v-else class="quest-card-data">Moves: 0</p>

          <p class="quest-card-data">
            Status: {{ QuestCardProps.currentQuest.status }}
          </p>
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
// Imports
import { QTreeNode } from 'quasar';
import { QuestData } from '../types';
import { useConversationStore, ibis_node_icon } from '../stores/conversation';
import { ref } from 'vue';

// Props
const QuestCardProps = defineProps<{
  currentQuest: QuestData;
  creator?: object;
  showQuestInfo?: boolean;
}>();

// Stores
const conversationStore = useConversationStore();

const showDialog = ref(false);

// Functions
function getDate(dte: string) {
  if (dte) {
    const date: Date = new Date(dte);
    const formattedDate: string = new Intl.DateTimeFormat('en-US').format(date);
    return formattedDate;
  }
}
function getLastActivity() {
  let date: Date = new Date();
  let newestDate;
  const dateArray: QTreeNode[] = [];
  const neighbourhood: Partial<QTreeNode> | undefined =
    conversationStore.getNeighbourhood;
  if (neighbourhood!.length) {
    neighbourhood!.forEach((pub: Partial<QTreeNode>) => {
      if (pub.status == 'published') {
        date = new Date(pub.updated_at);
        pub.updated_at = new Intl.DateTimeFormat('en-US').format(date);
        dateArray.push(pub);
      }
    });

    newestDate = dateArray.reduce((a, b) => {
      return new Date(a.updated_at) > new Date(b.updated_at) ? a : b;
    });
    if (newestDate) {
      return newestDate.updated_at;
    } else return 'No initial date';
  }
}
</script>
<style>
.quest_card {
  text-align: center;
  font-size: 1em;
  background-color: ivory;
}
.quest-card-title {
  border: black;
  max-width: 800px;
  width: 600px;
  margin: auto;
  text-align: center;
  font-size: 1.5em;
  padding-top: 3%;
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
