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
      <div class = "column items-center q-ma-sm q-pa-xs" >
        <div class="col-4 q-ma-sm q-pa-sm" style="width: 55%">
          <h4 id="h4" class="q-pa-xs q-ma-xs">Create New Quest</h4>
        </div>
      </div>
    <div class="column items-center">
      <div class="col-4 q-pa-xs" style="width: 55%">
        <q-card class="q-pl-xl">
        <div class="row justify-start">
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
      <q-input v-model="quest.name" label = "Name" style="width: 75%" />
    </div>
   <div class = "row justify-start q-pb-xs">
      Details<br/>
    </div>
    <div class = "row justify-start q-pb-lg">
      <q-editor :editor="editor" v-model="quest.description" style="width: 80%" ></q-editor>
    </div>
    <div class = "row justify-start q-pb-lg">
      <q-input v-model="quest.handle" label = "Handle" style="width: 40%"/>
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

import scoreboard from '../components/scoreboard.vue'
import member from '../components/member.vue'
import { mapActions} from "vuex";


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
      quest: {
        name: null,
        handle: null,
        status: 'draft',
        public: true,
        description: null
      },
      shape: 'line',
      submitResult: [],
      details: "",
      handle: "",
      type: false,
    };
  },
  components: {
    "scoreboard": scoreboard,
    "member": member
  },
  methods: {
    ...mapActions('quests', ['createQuests', 'findquests']),

    async doSubmit() {
      if (this.group === "public") {
        this.quest.public = true;
      }

       if (this.group === "private") {
        this.quest.public = false;
      }
      //console.log("Name ", quest.member.name);
      const conversations = this.createQuests(this.quest);
      const quests = await this.findQuests;
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
#h4 {
  color: blue;
  font-family: Arial, Helvetica, sans-serif;
  text-decoration: underline;
  text-align: center;
}
</style>
