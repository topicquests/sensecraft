<template>
  <div>
    <q-card id="quest_card">
          <q-card-section>
            <h6 v-if="currentQuest" style="text-align:center; color: darkgreen;">
              {{currentQuest.name}}
            </h6>
          </q-card-section>
          <q-card-section >
              <div v-if="currentQuest" style="font-size:17px">
                <div v-html="currentQuest.description"></div>
              </div>
          </q-card-section>
        </q-card>
      </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
   name: 'questCard',
  data () {
    return {}
  },
  computed: {
    ...mapState('quests', {
      currentQuest: state => state.currentQuest
    }),
  }
}
</script>
<style lang="styl">
#quest_card {
  border: 3px solid black;
  font-size: 10pt;
  color:darkgreen;
  height: 400px;
}
</style>