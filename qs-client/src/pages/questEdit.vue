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
      <div class="col-4 q-mb-xs q-mt-md q-pa-sm" style="width: 35%">
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
          <q-select v-model="quest.status" :options="options" label = "Status" style="width: 25%"/>
        </div>
        <div class = "row justify-start q-pb-lg q-ml-lg" >
          <q-input class="field-name" v-model="quest.name" label = "Quest name" style='width: 350px'/>
        </div>
        <div class = "row justify-start q-pb-xs q-ml-lg">
          Description<br/>
        </div>
        <div class = "row justify-start q-pb-lg q-ml-lg">
          <q-editor v-model="quest.description" class="q-editor"></q-editor>
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
      <h4>New Conversation Node</h4>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pb-lg q-mt-md" style="width: 35%">
        <q-card>
          <div class = "row justify-start q-pb-lg q-ml-lg">
            <div class="col-4">
              <q-input
                v-if="currentNode"
                v-model='currentNode.title'
                label = "Parent" />
            </div>
          </div>
          <div class = "row justify-start q-pb-lg q-ml-lg">
            <div class="col-4">
              <q-input v-model="node.title" label = "Node title" style='width: 350px'/>
            </div>
          </div>
          <div class = "row justify-start q-pb-lg q-ml-lg">
            <div class="col-4">
              <q-input v-model="node.node_type" label = "Type" />
            </div>
            <div class="col-4">
              <btn-question v-on:click.native="questionType"></btn-question>
            </div>
          </div>
          <div class = "row justify-start q-pb-xs q-ml-lg">
            Description<br/>
          </div>
          <div class = "row justify-start q-pb-lg q-ml-lg">
            <q-editor v-model="node.description" class="q-editor"/>
          </div>
          <div class = "row justify-center q-pb-lg">
            <q-btn label="Add" @click="addNode" color = "primary" class = "q-mr-md q-ml-md"/>
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
      node: {
        parent_id: null,
        quest_id: null,
        title:null,
        description: null,
        node_type: "reference",
        status: "published"
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
      currentConversation: state => state.parentNode[0]
    }),
    ...mapMutations('conversation', [{
      showTree: 'SHOW_TREE'
    }])
  },

  methods: {
    ...mapGetters('member', ['getUser']),
    ...mapActions('quests', [
      'updateQuests'
    ]),
    ...mapActions('conversation', [
      'addConversationNode',
      'getConversationByQuestId',
      'createConversationTree'
    ]),

    async show_tree() {
      try {
      let show;
      if (this.questConversation.length>0) {
        show = true;
        const resp = await this.createConversationTree();
      }else{
        show = false;
      }
      this.$store.commit('conversation/SHOW_TREE', show);
      return (console.log("able to show tree"))
      }
      catch(err) {
        console.log("Unable to show tree ", err);
      }
    },

    async questionType() {
      this.node.node_type = "question";
    },

    async addNode() {
      try {
      this.node.quest_id = this.quest.id;
      if(this.parentNode) {
        this.node.parent_id = this.parentNode.id;
      }
      const nodeResponse = await this.addConversationNode(this.node);
      const resp = await this.show_tree();
       this.$q.notify({
        message: `Added node to conversation`,
        color: "positive"
       });
      }
      catch(err) {
        console.log("there was an error in adding node ", err);
        this.$q.notify({
          message: `There was an error adding new node.`,
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
    const resp = await this.show_tree();
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
.q-editor {
width: 80%;
border: 1px solid black;
}
</style>
