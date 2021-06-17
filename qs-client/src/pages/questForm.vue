 <template>
  <q-page :padding="true" class = "flex flex-center">
    <div class = "col" > 
    <div class = "row justify-center"> 
      <h3>Create New Quest</h3>
    </div>
    <div> 
      <q-card> 
        <div class="row justify-start q-pa-lg">          
          <div class="q-gutter-sm">
            <q-option-group
            v-model="group"
            :options="options"
            color="primary"
            inline>
            </q-option-group>             
         </div>    
        </div>
    <div class = "row justify-start q-pb-lg">      
      <q-input v-model="quest.name" label = "Name" />
    </div>    
   <div class = "row justify-start q-pb-xs">       
      Details<br/>
    </div>
    <div class = "row justify-start q-pb-lg">       
      <ckeditor type="classic" v-model="details" ></ckeditor>
    </div>
    <div class = "row justify-start q-pb-lg">       
      <q-input v-model="quest.handle" label = "Handle" />
    </div>
   <div class = "row justify-start q-pb-lg">   
      <q-btn label="Submit" @click="doSubmit" color = "primary" class = "q-mr-md q-ml-md"/>
      <q-btn label="Cancel" @click="$router.replace('/home')" />
    </div>
      </q-card>
    </div>    
  </div>  
  </q-page>
</template>

<script>

import Vue from 'vue'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import VueCkeditor from 'vue-ckeditor5'
const options = {
  editors: {
    classic: ClassicEditor,
  },
  name: 'ckeditor'
}
 
Vue.use(VueCkeditor.plugin, options);
import { mapActions, mapGetters} from "vuex";


export default {
  data() {
    return { 
      group: 'private',
      options: [
        {
          label: 'Public',
          value: 'public'
        },
        {
          label: 'Private',
          value: 'private'
        }        
      ],
      quest: {
        name: null,
        handle: null,
        status: 'draft',
        public: false,        
      },
      shape: 'line',
      submitResult: [],
      details: "",
      handle: "",
      type: false,
      user: this.$store.getters['user/getUser']
    };
  },
  methods: {
    //...mapActions('quests', ['quest/createQuests']),
    ...mapGetters('user', ['getUser']),

    doSubmit: function() {
      if (this.group === "public") {
        this.quest.public = true;
      }

       if (this.group === "private") {
        this.quest.public = false;
      }
      //console.log("Name ", quest.user.name);
      const conversations = this.$store.dispatch("quests/createQuests", this.quest);
    },
  },
};
</script>

<style>
.details {
  max-width: 960px;
  min-height: 800px;
  overflow: auto;
  overflow-wrap: normal;
}
</style>
