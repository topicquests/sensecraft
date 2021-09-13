<template>
  <q-page style ="background-color:lightgrey" >
    <div class="column items-center">
        <div class="col-4 q-pa-lg" style="width: 55%">
        <scoreboard></scoreboard>
        </div>
    </div>
    <questCard v-bind:currentQuest ="quest"></questCard>
  </q-page>
</template>

<script>
import questCard from '../components/quest-card.vue'
import scoreboard from '../components/scoreboard.vue'
import {mapActions, mapState} from 'vuex'

export default {
  name: 'questview',
  data() {
    return {

    }
  },
  computed: {
    ...mapState("quests", {
      quest: state => state.currentQuest
    })

  },
  components: {
    "questCard": questCard,
    "scoreboard": scoreboard
  },
  methods: {
...mapActions("quests", [
  "setCurrentQuest"
])
  },
  async created() {
   const questId = this.$route.params.quest_id;
   const quest = await this.setCurrentQuest(questId)
  }
}

</script>
