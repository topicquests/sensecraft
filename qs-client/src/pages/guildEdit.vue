 <template>
 <q-page style ="background-color:lightgrey" >
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class = "col" >
    <div class = "row justify-center">
      <h3>Edit Guild</h3>
    </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <q-card class="q-pl-md">
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
          <div class = "row justify-start q-pb-lg q-ml-lg">
            <q-editor v-model="guild.description"></q-editor>
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

import scoreboard from '../components/scoreboard.vue'
import member from '../components/member.vue'
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
        created_at: null,
        updated_at: null
      },
      shape: 'line',
      submitResult: [],
      details: "",
      handle: "",
      type: false,
      member: this.$store.getters['member/getUser']
    };
  },
   components: {
    "scoreboard": scoreboard,
    "member": member
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
