 <template>
  <q-page :padding="true" class = "flex flex-center">
    <div class = "col" >
    <div class = "row justify-center">
      <h3>Edit Quest</h3>
    </div>
    <div>
      <q-card>
        <div class="row justify-start q-pa-lg">
          <div class="q-gutter-sm">
            <q-option-group
            v-model="group"
            :options="choices"
            color="primary"
            inline>
            </q-option-group>
         </div>
        </div>
    <div class = "row justify-start q-pb-lg">
      <q-input v-model="quest.status" label = "Status" />
    </div>
    <div class = "row justify-start q-pb-lg">
      <q-input v-model="quest.name" label = "Name" />
    </div>
   <div class = "row justify-start q-pb-xs">
      Details<br/>
    </div>
    <div class = "row justify-start q-pb-lg">
      <ckeditor :editor="editor" v-model="quest.description"></ckeditor>
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
import VueCkeditor from '@ckeditor/ckeditor5-vue2'
const options = {
  editors: {
    classic: ClassicEditor,
  },
  name: 'ckeditor'
}

Vue.use(VueCkeditor);
import { mapActions, mapGetters} from "vuex";


export default {
  data() {
    return {
      editor: ClassicEditor,
      editorData: '<p>Content of the editor.</p>',
      group: 'private',
      choices: [
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
        id: null,
        description: null,
        creator: null,
        created_at: null,
        updated_at: null
      },
      shape: 'line',
      submitResult: [],
      details: "These are details",
      handle: "",
      type: false,
      member: this.$store.getters['member/getUser']
    };
  },
  methods: {
    //...mapActions('quests', ['quest/createQuests']),
    ...mapGetters('member', ['getUser']),

    async doSubmit() {
      try {
        if (this.group === "public") {
          this.quest.public = true;
        }

        if (this.group === "private") {
          this.quest.public = false;
      }
      const questUpdateResponse = await this.$store.dispatch("quests/updateQuests", this.quest);
      console.log("Quest update: ", questUpdateResponse);
       this.$q.notify({
        message: `Quest was updated successfully`,
        color: "positive"
       });
      }
      catch(err) {
        console.log("there was an error in updating quest ", err);
        this.$q.notify({
          message: `There was an error updating quest. If this issue persists, contact support.`,
          color: "negative"
        });
      }
    }
  },

  mounted() {
   this.$data.quest.id = this.$route.params.id;
   const response = this.$store.getters['quests/getQuestById'] (this.$data.quest.id);
   this.$data.quest = response[0];
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
