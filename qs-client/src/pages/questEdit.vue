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
    <div class="column items-center " v-if="quest">
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
          <q-select v-model="quest.status" :options="quest_status" label = "Status" style="width: 25%"/>
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
          <span label = "Handle">{{quest.handle}}</span>
        </div>
        <div class = "row justify-center q-pb-lg">
          <q-btn label="Submit" v-bind:disabled="!isAdmin" @click="doSubmitQuest" color = "primary" class = "q-mr-md q-ml-md"/>
          <q-btn label="Cancel" @click="$router.push({name: 'home'})" />
        </div>
        </q-card>
      </div>
    </div>
    <div class = "col-4 q-ma-sm" >
      <h4 v-if="!node.id">New Conversation Node</h4>
      <h4 v-if="node.id">Update Conversation Node</h4>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pb-lg q-mt-md" style="width: 35%">
        <q-card>
          <div class = "row justify-start q-pb-lg q-ml-lg">
            <div class="col-4">
              <btn-question v-on:click.native="questionType"></btn-question>
            </div>
          </div>
          <div class = "row justify-start q-pb-lg q-ml-lg">
            <div class="col-4">
              <q-input v-model="node.title" label = "Node title" style='width: 350px'/>
            </div>
          </div>
          <div class = "row justify-start q-pb-xs q-ml-lg">
            Description<br/>
          </div>
          <div class = "row justify-start q-pb-lg q-ml-lg">
            <q-editor v-model="node.description" class="q-editor"/>
          </div>
          <div class = "row justify-start q-pb-lg q-ml-lg">
            <q-select v-model="node.status" :options="node_status" label = "Status" style="width: 25%"/>
          </div>
          <div class = "row justify-center q-pb-lg">
            <q-btn v-if="node.id" v-bind:disabled="!isAdmin" label="Update" @click="updateNode" color = "primary" class = "q-mr-md q-ml-md"/>
            <q-btn v-if="!node.id" v-bind:disabled="!isAdmin" label="Add" @click="addNode" color = "primary" class = "q-mr-md q-ml-md"/>
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
import app from '../App'

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
      quest_status: [
        "draft",
        "registration",
        "ongoing",
        "finished"
      ],
      node_status: [
        'obsolete',
        'private_draft',
        'guild_draft',
        'proposed',
        'submitted',
        'published'
      ],
      defaultNode: {
        title: '',
        description: '',
        status: 'private_draft',
        node_type: 'question',
      },
      isAdmin: false,
      quest_id: null,
    };
  },
  components: {
    "scoreboard": scoreboard,
    "member": member,
    "btnQuestion": btnQuestion
  },
  computed: {
    ...mapState('member', ['member']),
    ...mapGetters('quests',[
      'getQuestById',
      'isQuestMember',
    ]),
    ...mapGetters('conversation', [
      'getRootNode'
    ]),
    ...mapGetters(['hasPermission']),
    node: function() {
      return this.getRootNode || this.defaultNode;
    },
    quest: function() {
      return this.getQuestById(this.quest_id)
    },
  },

  methods: {
    ...mapActions('quests', [
      'updateQuest',
      'ensureQuest'
    ]),
    ...mapActions('member', ['ensureLoginUser']),
    ...mapActions('conversation', [
      'createConversationNode',
      'updateConversationNode',
      'fetchConversationNeighbourhood',
      'fetchRootNode',
    ]),

    async addNode() {
      try {
        const node = this.node
        node.quest_id = this.quest_id
        await this.createConversationNode({data: node});
        this.$q.notify({
          message: `Added node to conversation`,
          color: "positive"
        });
        await this.fetchRootNode({params: {quest_id: this.quest_id}});
      }
      catch(err) {
        console.log("there was an error in adding node ", err);
        this.$q.notify({
          message: `There was an error adding new node.`,
          color: "negative"
        });
      }
    },
    async updateNode() {
      try {
        const node = this.node
        await this.updateConversationNode({data: node});
        this.$q.notify({
          message: `Root node updated`,
          color: "positive"
        });
      }
      catch(err) {
        console.log("there was an error in adding node ", err);
        this.$q.notify({
          message: `There was an error adding root node.`,
          color: "negative"
        });
      }
    },

    async doSubmitQuest() {
      try {
        if (this.group === true) {
          this.quest.public = true;
        }

        if (this.group === false) {
          this.quest.public = false;
      }
      const questUpdateResponse = await this.updateQuest({data: this.quest});
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

  async beforeMount() {
    this.quest_id = this.$route.params.quest_id;
    await app.userLoaded
    await this.ensureQuest(this.quest_id);
    // TODO: Add this permission
    // this.isAdmin = this.hasPermission('quest_admin', null, this.quest_id);
    this.isAdmin = this.isQuestMember(this.quest_id);
    await this.fetchRootNode({params: {quest_id: this.quest_id}});
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
