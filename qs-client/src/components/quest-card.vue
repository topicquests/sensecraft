<template>
  <div>
    <div class="col-4 q-pa-lg">
        <q-card v-if="currentQuestCard" class="quest_card">
          <section id="quest-card-title">
            <q-avatar size="56px" class="q-ma-sm">
              <img src="../statics/images/question.png">
            </q-avatar>
            <h5 class="q-ma-md">
                {{currentQuestCard.name}}
            </h5>
          </section>
          <section id="quest-card-details">
            <div v-html="currentQuestCard.description" class ="q-mb-xl"></div>
          </section>
            <section id="quest-card-data" >
              <p class="q-ml-md q-pb-none q-mb-sm q-pt-xl"> Quest Creator: {{creator.handle}}</p>
              <p class="q-pt-none q-ml-md q-mb-sm"> Quest Handle: {{currentQuestCard.handle}}</p>
               <p class="q-pt-sm q-ml-md"> Start Date: {{currentQuestCard.start}}</p>
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
#quest-card-details {
 background-color: aquamarine;
 text-align: left;
 font-size: 1.2em;
 padding-top: 3%;
 padding-left: 1%;
 border: 1px solid gray;
}
#quest-card-title {
  border: 1px solid gray;
  background-color: lightgray;
}
#quest-card-data {
  text-align: left;
  font-size: 1.2em;
  background-color: aquamarine;
}
</style>