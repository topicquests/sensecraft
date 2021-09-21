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
              v-model="guild.public"
              :options="choices"
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
            <q-btn label="Cancel" @click="$router.push({name: 'home'})" />
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>

import scoreboard from '../components/scoreboard.vue'
import member from '../components/member.vue'
import { mapActions, mapState, mapGetters} from "vuex";
import app from '../App'

export default {
  data() {
    return {
      group: 'public',
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
      guild_id: null,
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
  computed: {
    ...mapState('member', ['member']),
    guild: () => {
      this.getGuildById(this.guild_id)
    },
  },
  methods: {
    //...mapActions('quests', ['quest/createQuests']),
    ...mapGetters('guilds', ['getGuildById']),
    ...mapActions('guilds', ['updateGuild']),

    doSubmit: async function() {
      if (this.group === true) {
        this.guild.public = true;
      }

       if (this.group === false) {
        this.guild.public = false;
      }
      //console.log("Name ", quest.member.name);
      const res = await this.updateGuild({data: this.guild});
    }
  },

  async beforeMount() {
    this.guild_id = this.$route.params.id;
    await app.userLoaded
    await ensureGuild(this.guild_id)
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
