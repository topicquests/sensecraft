<template>
  <div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 45%">
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
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
   name: 'questCard',
   props: {
     currentQuest: {
       type: Object
     }
   },
  data () {
    return {

    }
  }
}
</script>
<style>
#quest_card {
  border: 3px solid black;
  font-size: 10pt;
  color:darkgreen;
  height: 400px;
}
</style>