<template>
  <div>
    <div class="col-4 q-pa-lg">
        <q-card v-if="currentQuestCard" class="quest_card">
          <q-avatar size="56px" class="q-ma-sm">
            <img src="../statics/images/question.png">
          </q-avatar>
          <h5 class="q-ma-md">
              {{currentQuestCard.name}}
          </h5>
          <div v-html="currentQuestCard.description" class="quest_card q-mb-xl" style="border: none;"></div>
            <section style="text-align: left" >
              <p class="q-ml-md q-pb-none q-mb-sm q-pt-xl quest_card" style="font-size: 1.2em; border: none; text-align:left;"> Quest Creator: {{creator.handle}}</p>
              <p class="q-pt-none q-ml-md q-mb-sm quest_card" style="font-size: 1.2em; border: none; text-align:left;"> Quest Handle: {{currentQuestCard.handle}}</p>
               <p class="q-pt-sm q-ml-md quest_card" style="font-size: 1.2em; border: none; text-align:left;"> Start Date: {{currentQuestCard.start}}</p>
            </section>
        </q-card>
    </div>
  </div>
</template>

<script>
export default {
   name: 'questCard',
   props: {
     currentQuestCard: {
       type: Object
     },
     creator: {
       type: Object
     }
   },
  data () {
    return {

    }
  },
  computed: {

  },
}
</script>
<style>
.quest_card {
  text-align:center;
  border: 3px solid black;
  font-size: 1.2em;
  color:darkgreen;
  background-color: aquamarine;
}
</style>