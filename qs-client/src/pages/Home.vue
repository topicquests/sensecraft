<template>
<q-page class="bg-blue">
  <div class="row justify-center text-center bg-primary">          
           <div class="text-h4 text-bold text-white q-pt-lg q-pb-lg"> Where teams co-construct structured conversation</div>           
  </div>  
  <div class="row justify-center">
    <img  class="q-pt-xl q-pb-lb " src="../statics/earthrise2.png" 
    style ="margin-left:auto; margin-right:auto">
  </div> 
  <div class="row q-pb-sm q-pt-xl q-md-lg">
    <div class="text-h5 text-bold q-px-sm q-pt-md">Videos to improve your communication skills</div>
  </div>

  <div class="row q-pt-xs" > 
    <div class="col-12 col-md q-pa-md">      
      <q-card class="my-card">
        <q-video src="https://www.youtube.com/embed/WPF64UXFER0" style="height: 300px"/>         
      </q-card>      
    </div>

  <div class="col-12 col-md q-pa-md">    
    <q-card class="my-card">
       <q-video src="https://www.youtube.com/embed/WPF64UXFER0" style="height: 300px"/>       
    </q-card>
  </div>  
    
  <div class="col-12 col-md">
    <div class="q-pa-md">
      <q-card class="my-card">
       <q-video src="https://www.youtube.com/embed/WPF64UXFER0" style="height: 300px"/>       
      </q-card>
    </div>  
  </div>
  </div>
</q-page>
</template>


<script>

import {mapActions} from "vuex";

  export default {
    data() {
      return {
          payload: 100
        }
      },
  
  computed: {
        

  },


  methods: {
   ...mapActions('quests', ['quests/findQuests'])   
  },
 
  async beforeMount() {        
     const conversations = await this.$store.dispatch('quests/findQuests');     
  }
        
    };
</script>

<style lang="scss" scoped>
.p1 {
  font: italic 20px Arial, sans-serif;
}
</style>