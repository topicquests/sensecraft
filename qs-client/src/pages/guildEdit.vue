 <template>
  <q-page :padding="true" class = "flex flex-center">
    <div class = "col" > 
    <div class = "row justify-center"> 
      <h3>Edit Guild</h3>
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
      <q-input v-model="guild.name" label = "Name" />
    </div>    
   <div class = "row justify-start q-pb-xs">       
      Details<br/>
    </div>
    <div class = "row justify-start q-pb-lg">       
      <ckeditor type="classic" v-model="guild.description" ></ckeditor>
    </div>
    <div class = "row justify-start q-pb-lg">       
      <q-input v-model="guild.handle" label = "Handle" />
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
      group: 'public',
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
      guild: {
        name: null,
        handle: null,
        open_for_applications: null,
        public: false, 
        id: null,
        description: null,
        creator: null, 
        createdAt: null, 
        updatedAt: null     
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
        this.guild.public = true;
      }

       if (this.group === "private") {
        this.guild.public = false;
      }
      //console.log("Name ", quest.user.name);
      const conversations = this.$store.dispatch("guilds/updateGuilds", this.guild);
    }
  },
  
  mounted() {
   this.$data.guild.id = this.$route.params.id;   
   console.log("Guild id: ", this.$data.guild.id);
   const response = this.$store.getters['guilds/getGuildById'] (this.$data.guild.id);
   console.log("Guild respone: ", response[0]);
   this.$data.guild = response[0];  
  }
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
