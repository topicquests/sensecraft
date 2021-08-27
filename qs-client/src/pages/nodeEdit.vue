 <template>
  <q-page style ="background-color:lightgrey" >
    <div>
      <member></member>
    </div>
    <div class="column items-center">
        <div class="col-4 q-pb-xs q-mt-md" style="width: 55%">
          <scoreboard></scoreboard>
        </div>
    </div>
      <div class="col-12" style="width: 100%">
        <h4 class="q-pb-sm q-ma-sm">Edit Quest</h4>
      </div>
    <div class="column items-center ">
      <div class="col-4 q-mb-xs q-mt-md q-pa-sm" style="width: 55%">
        <q-card>
          <div class="row justify-start q-pa-lg q-ml-lg q-gutter-sm">
            <q-option-group
              v-model="quest.public"
              :options="choices"
              color="primary"
              inline>
            </q-option-group>
          </div>
        <div class = "row justify-start q-pb-lg q-ml-lg">
          <q-select v-model="quest.status" :options="options" label = "Status" style="width: 15%"/>
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
    </div>
    <div class = "col-4 q-ma-sm" >
      <h4>New Conversation</h4>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pb-lg q-mt-md" style="width: 55%">
        <q-card>
          <div class = "row justify-start q-pb-lg q-ml-lg">
            <div class="col-4">
              <q-input
                v-if="currentConversation"
                v-model='currentConversation.title'
                label = "Parent" />
            </div>
          </div>
          <div class = "row justify-start q-pb-lg q-ml-lg">
            <div class="col-4">
              <q-input v-model="conversation.title" label = "Conversation" />
            </div>
          </div>
          <div class = "row justify-start q-pb-lg q-ml-lg">
            <div class="col-4">
              <q-input v-model="conversation.node_type" label = "Type" />
            </div>
            <div class="col-4">
              <btn-question v-on:click.native="questionType"></btn-question>
            </div>
          </div>
          <div class = "row justify-start q-pb-xs q-ml-lg">
            Details<br/>
          </div>
          <div class = "row justify-start q-pb-lg q-ml-lg">
            <q-editor v-model="conversation.description" style="width: 60%"/>
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
import { mapActions, mapGetters, mapState, mapMutations} from "vuex";
import scoreboard from '../components/scoreboard.vue'
import member from '../components/member.vue'
import btnQuestion from '../components/btn-question.vue'

export default {
  data() {
    return {
      group: 'private',
      choices: [
        {
          label: 'Public',
          value: true
        },
        {
          label: 'Private',
          value: false
        }
      ],
      options: [
        "draft",
        "registration",
        "ongoing",
        "finished"
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
        parent_id: null,
        quest_id: null,
        title:null,
        description: null,
        node_type: "reference"
      },
      member: this.getUser
    };
  },
  components: {
    "scoreboard": scoreboard,
    "member": member,
    "btnQuestion": btnQuestion
  },
  computed: {
...mapGetters('quests',[
    'getQuestById'
    ]),
   ...mapGetters('member', [
     'getUser'
   ]),
...mapState('conversation', {
      questConversation: state => state.conversation,
      currentConversation: state => state.parentConversation[0]
    }),
    ...mapMutations('conversation', [{
      showTree: 'SHOW_TREE'
    }])
  },

  methods: {
    //...mapActions('quests', ['quest/createQuests']),
    ...mapGetters('member', ['getUser']),
    ...mapActions('quests', [
      'updateQuests'
    ]),
    ...mapActions('conversation', [
      'addConversation',
      'getConversationByQuestId',
      'createConversationTree'
    ]),

    show_tree(show) {
      this.$store.commit('conversation/SHOW_TREE', show);
    },

    async questionType() {
      this.conversation.node_type = "question";
    },

    async addFirstConversation() {
      try {
      this.conversation.quest_id = this.quest.id;
      if(this.currentConversation) {
        this.conversation.parent_id = this.currentConversation.id;
      }
      await this.addConversation(this.conversation);
      this.createConversationTree();
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
        if (this.group === true) {
          this.quest.public = true;
        }

        if (this.group === false) {
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

  async mounted() {
    this.quest.id = this.$route.params.quest_id;
    const response = this.getQuestById(this.quest.id);
    this.quest = response[0];
    const quest_id = this.quest.id;
    const conversationResponse = await this.getConversationByQuestId(quest_id);
    console.log("conversation length", this.questConversation)
    if (this.questConversation) {
     this.show_tree(true);
     const resp = this.createConversationTree();
    }else{
      this.show_tree(false);
    }
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

h4 {
  text-align: center;
  color: blue
}
</style>
