<template>
 <q-page style ="background-color:lightgrey" >

     <div>
      <member></member>
    </div>
    <div class="column items-center">
    <div class="column items-center q-mb-md">
      <div class="col-4" id="scoreboard">
        <scoreboard></scoreboard>
      </div>
    </div>
    <questCard v-bind:currentQuestCard ="getCurrentQuest" style="width: 100%" :creator="getQuestCreator()"></questCard>
   </div>
  </q-page>
</template>

<script>
import {mapGetters, mapActions, mapState} from 'vuex'
import scoreboard from '../components/scoreboard.vue'
import member from '../components/member.vue'
import questCard from '../components/quest-card.vue'
export default {
   name: 'GamePlay',
   data() {
     return {
       guildId: null,
       questId: null,
     }
   },
   components: {
    "scoreboard": scoreboard,
    "member": member,
    "questCard": questCard,
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

    this.guildId = this.$route.params.guild_id;
    this.questId = this.$route.params.quest_id;
    const questId = this.$route.params.quest_id;
    await this.setCurrentQuest(this.questId)
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
