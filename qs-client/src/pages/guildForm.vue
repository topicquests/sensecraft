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
    <div class = "row justify-center">
      <h4 id="h4" class="q-pa-xs q-ma-xs">Create New Guild</h4>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-md" style="width: 55%">
        <q-card class="q-pl-md">
          <div class="row justify-start q-pa-lg">
            <q-option-group
            v-model="group"
            :options="options"
            color="primary"
            inline>
            </q-option-group>
          </div>
          <div class = "row justify-start q-pb-lg" >
            <q-input class="guildText" v-model="guild.name" label="Name"/>
          </div>
   <div class = "row justify-start q-pb-xs">
      Details<br/>
    </div>
     <div class = "row justify-start q-pb-lg">
      <q-editor v-model="guild.description" style="width: 55%" ></q-editor>
    </div>
    <div class = "row justify-start q-pb-lg">
      <ckeditor :editor="editor" v-model="guild.description" ></ckeditor>
    </div>
    <div class = "row justify-start q-pb-lg">
      <q-input v-model="guild.handle" label = "Handle" class="guildText" />
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

import {mapGetters, mapActions, mapState} from "vuex";
import scoreboard from '../components/scoreboard.vue'
import member from '../components/member.vue'

export default {
  data() {
    return {
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
  computed: {
    ...mapState('member', {
      member: state => state.member
    })
  },

   components: {
    "scoreboard": scoreboard,
    "member": member,
  },
  methods: {
    //...mapActions('quests', ['quest/createQuests']),
    ...mapGetters('member', ['getUser']),
    ...mapActions('guilds', [
      'createGuilds',
      'checkBelongsToGuild',
      'getGuildByHandle'
    ]),

    async doSubmit() {
      if (this.group === "public") {
        this.guild.public = true;
      }
       if (this.group === "private") {
        this.guild.public = false;
      }
      const guild = await this.createGuilds(this.guild);
      const gm = await this.checkBelongsToGuild(this.member.id)
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

.guildText {
  color: blue;
  font-family: Arial, Helvetica, sans-serif;
  width: 25%;
}

#h4 {
  color: blue;
  font-family: Arial, Helvetica, sans-serif;
  text-decoration: underline;
  text-align: center;
}
</style>
