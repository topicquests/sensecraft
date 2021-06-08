 <template>
  <q-page :padding="true" class = "flex flex-center">
    <div class = "col" > 
    <div class = "row justify-center"> 
      <h6>Create New Quest</h6>
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
import api from 'src/api'
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
import { mapActions} from "vuex";


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
        public: false
      }
      ,
       shape: 'line',
      submitResult: [],
      details: "",
      handle: "",
      type: false,
      user: this.$store.getters.user
    };
  },
  methods: {
    ...mapActions('quests', ['createQuests']),

    doSubmit: function() {
      if (this.group === "public") {
        this.quest.public = true;
      }

       if (this.group === "private") {
        this.quest.public = false;
      }
      const conversations = this.$store.dispatch('createQuests', this.quest)
      .then(response => {             
          this.$q.notify({
            type: "positive",
            message: "New quest created successfully"
          });
        })
        // Just use the returned error instead of mapping it from the store.
        .catch((error) => {
            console.log('HEY! Error!:', { error });
            this.$q.notify({
            type: "negative",
            message: "There was an issue creating new quest"
          });
        });        
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
