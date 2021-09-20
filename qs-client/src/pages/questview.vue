<template>
   <q-page style="background-color: #CAF0F8">
    <div class="column items-center">
        <div class="col-4 q-pa-lg" style="width: 55%">
        <scoreboard></scoreboard>
        </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <questCard v-bind:currentQuestCard ="getCurrentQuest" :creator="getQuestCreator()"></questCard>
      </div>
    </div>
  </q-page>
</template>

<script>
import questCard from '../components/quest-card.vue'
import scoreboard from '../components/scoreboard.vue'
import {mapActions, mapState, mapGetters} from 'vuex'

export default {
  name: 'quest_page',
  data() {
    return {

    }
  },
  computed: {
    ...mapState("quests", {
      questId: state => state.currentQuest
    }),
   ...mapGetters('quests', [
      'getCurrentQuest',
   ]),
   ...mapGetters("members", [
     "getMemberById",
   ])
  },
  components: {
    "questCard": questCard,
    "scoreboard": scoreboard
  },
  methods: {
    ...mapActions("quests", [
    "setCurrentQuest",
    "fetchQuestById"
    ]),
    ...mapActions("members", [
      "fetchUserById"
    ]),
    getQuestCreator() {
      return this.getMemberById(this.getCurrentQuest.creator)
    }
  },
  async created() {
    try {
    const questId = this.$route.params.quest_id;
    await this.setCurrentQuest(questId)
    const thisQuest = await this.fetchQuestById({params: {id: questId}});
    const quest = this.getCurrentQuest;
    await this.fetchUserById({params: {id: quest.creator}});
    const creator = this.getMemberById(quest.creator);
    }
    catch(error) {
      console.log("Error in questview create: ", error)
    }
  }
}

</script>
