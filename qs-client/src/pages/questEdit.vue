 <template>
  <q-page style ="background-color:lightgrey" >
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class = "row">
      <div class = "col-4 col-md q-ma-lg" >
        <h4>Edit Quest</h4>
      </div>
      <div class = "col-4 col-md q-ma-lg" >
        <h4>New Conversation</h4>
      </div>
    </div>
    <div class="row">
      <div class = "col-4 col-md q-ma-lg" >
        <q-card>
          <div class="row justify-start q-pa-lg q-ml-lg q-gutter-sm">
            <q-option-group
              v-model="group"
              :options="choices"
              color="primary"
              inline>
            </q-option-group>
          </div>
        <div class = "row justify-start q-pb-lg q-ml-lg">
          <q-input v-model="quest.status" label = "Status" />
        </div>
        <div class = "row justify-start q-pb-lg q-ml-lg" >
          <q-input class="field-name" v-model="quest.name" label = "Name" style='width: 250px'/>
        </div>
        <div class = "row justify-start q-pb-xs q-ml-lg">
          Details<br/>
        </div>
        <div class = "row justify-start q-pb-lg q-ml-lg">
          <q-editor v-model="quest.description"></q-editor>
        </div>
        <div class = "row justify-start q-pb-lg q-ml-lg">
          <q-input v-model="quest.handle" label = "Handle" />
        </div>
        <div class = "row justify-center q-pb-lg">
          <q-btn label="Submit" @click="doSubmit" color = "primary" class = "q-mr-md q-ml-md"/>
          <q-btn label="Cancel" @click="$router.replace('/home')" />
        </div>
        </q-card>
      </div>
      <div class = "col-4 col-md q-ma-lg" >
        <q-card>
          <div class = "row justify-start q-pb-lg q-ml-lg">
            <q-input v-model="conversation.title" label = "First conversation" />
          </div>
          <div class = "row justify-start q-pb-xs q-ml-lg">
            Details<br/>
          </div>
          <div class = "row justify-start q-pb-lg q-ml-lg">
            <q-editor v-model="conversation.description" />
          </div>
           <div class = "row justify-center q-pb-lg">
            <q-btn label="Add" @click="addFirstConversation" color = "primary" class = "q-mr-md q-ml-md"/>
           </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapActions, mapGetters} from "vuex";
import scoreboard from '../components/scoreboard.vue'

export default {
  data() {
    return {
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
      conversation: {
        quest_id: null,
        title:null,
        description: null,
        node_type: "reference"
      },
      shape: 'line',
      submitResult: [],
      details: "These are details",
      handle: "",
      type: false,
      member: this.$store.getters['member/getUser']
    };
  },
  components: {
    "scoreboard": scoreboard
  },

  methods: {
    //...mapActions('quests', ['quest/createQuests']),
    ...mapGetters('member', ['getUser']),
    ...mapActions('quests', [
      'updateQuests'
    ]),
    ...mapActions('conversation', [
      'addConversation'
    ]),

    async addFirstConversation() {
      try {
      this.conversation.quest_id = this.quest.id;
      await this.addConversation(this.conversation);
       this.$q.notify({
        message: `Added conversation`,
        color: "positive"
       });
      }
      catch(err) {
        console.log("there was an error in adding conversation ", err);
        this.$q.notify({
          message: `There was an error adding new conversation.`,
          color: "negative"
        });
      }
    },

    async doSubmit() {
      try {
        if (this.group === "public") {
          this.quest.public = true;
        }

        if (this.group === "private") {
          this.quest.public = false;
      }
      const questUpdateResponse = await this.updateQuests(this.quest);
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
   this.quest.id = this.$route.params.id;
   const response = this.$store.getters['quests/getQuestById'] (this.quest.id);
   this.quest = response[0];
   debugger;
  }
};
</script>

<style>
.name-field {
  transition: width .36s;
  width: 1500px;
}
.details {
  max-width: 1500px;
  min-height: 800px;
  overflow: auto;
  overflow-wrap: normal;
}
</style>
