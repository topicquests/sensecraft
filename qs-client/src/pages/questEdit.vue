 <template>
  <q-page :padding="true" class = "flex flex-center" style ="background-color:lightgrey" >
    <div class = "col" >
    <div class = "row justify-center">
      <h3>Edit Quest</h3>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg q-pl-lg" style="width: 1000px">
        <q-card>
        <div class="row justify-start q-pa-lg q-ml-lg">
          <div class="q-gutter-sm">
            <q-option-group
            v-model="group"
            :options="choices"
            color="primary"
            inline>
            </q-option-group>
         </div>
        </div>
      <div class = "row justify-start q-pb-lg q-ml-lg">
        <q-input v-model="quest.status" label = "Status" />
      </div>
      <div class = "row justify-start q-pb-lg q-ml-lg">
        <q-input v-model="quest.name" label = "Name" />
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
  </div>
  </q-page>
</template>

<script>
import { mapActions, mapGetters} from "vuex";

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
   this.quest.id = this.$route.params.id;
   const response = this.$store.getters['quests/getQuestById'] (this.quest.id);
   this.quest = response[0];
   debugger;
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
