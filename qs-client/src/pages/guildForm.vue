 <template>
  <q-page :padding="true" class = "flex flex-center">
    <div class = "col" >
    <div class = "row justify-center">
      <h3>Create New Guild</h3>
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
      <q-editor v-model="guild.description" ></q-editor>
    </div>
    <div class = "row justify-start q-pb-lg">
      <ckeditor :editor="editor" v-model="guild.description" ></ckeditor>
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
import VueCkeditor from '@ckeditor/ckeditor5-vue2'

Vue.use(VueCkeditor);
import { mapActions, mapGetters} from "vuex";


export default {
  data() {
    return {
      editor: ClassicEditor,
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
      guild: {
        name: null,
        handle: null,
        public: false,
        description: null
      },
      shape: 'line',
      submitResult: [],
      details: "",
      handle: "",
      type: false,
      member: this.$store.getters['member/getUser']
    };
  },
  methods: {
    //...mapActions('quests', ['quest/createQuests']),
    ...mapGetters('member', ['getUser']),

    doSubmit: function() {
      if (this.group === "public") {
        this.guild.public = true;
      }

       if (this.group === "private") {
        this.guild.public = false;
      }
      //console.log("Name ", quest.member.name);
      const guild = this.$store.dispatch("guilds/createGuilds", this.guild);
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
