<template>
  <q-page padding class="bg-light-blue">
    <div class="row">
      <div class="col-4">
        <scoreboard></scoreboard>
        <p></p>
        <q-card class="bg-light-blue no-border">
          <div v-for="quest in questGamePlay" :key="quest.id">
            <q-radio v-model="questId" v-on:click.native="getCurrentQuest" color="black" style="font-size:20px" :val="quest.id" :label="quest.name"> </q-radio>
          </div>
        </q-card>
      </div>
      <div class="col-2"></div>
      <div class ="col-6 q-pr-xl">
        <q-card v-if = "permission">
          <q-table title="Quests" :data="quests" :columns="columns1" row-key = "desc">
            <template slot="body" slot-scope="props">
              <q-tr :props="props">
                <q-td key="desc" :props="props"> {{props.row.name}}</q-td>
                <q-td key="handle" :props="props">{{props.row.handle}}</q-td>
                <q-td key="status" :props="props">{{props.row.status}}</q-td>
                <q-td key="start" :props="props">{{props.row.start}}</q-td>
                <q-td key="questNodeId" auto-width :props="props">
                  <q-btn label="Register" @click="doRegister(props.row.id)" class = "q-mr-md q-ml-md"/>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
       <p style="text-align:center; font-size:40px"> {{guild.name}}</p>
      </div>
    </div>
    <div v-if="quest" class="q-mt-xl row text-h6">
    </div>
    <div class="row handles">
      <div class="col-3">
       <p style="text-align:center; font-size:20px">Team</p>
      </div>
      <div class="col-6">
       <p style="text-align:center; font-size:20px">Quest Move</p>
      </div>
      <div class="col-3">
       <p style="text-align:center; font-size:20px">Current Quest</p>
      </div>
    </div>
    <div class="row q-mt-xs handles">
      <div class="col-3">
        <q-card>
          <ul>
            <li v-for="handle in handles" :key="handle.handle">
              {{handle}}
            </li>
          </ul>
        </q-card>
      </div>
      <div class="col-6">
      </div>
      <div class="col-3">
        <q-card>
          <q-section class="q-pt-lg q-pb-xs">
            <h6 v-if="currentQuest" style="text-align:center"> {{currentQuest.name}}</h6>
          </q-section>
          <q-section >
            <p v-if="currentQuest" style="font-size:17px">{{currentQuest.description}}</p>
          </q-section>
          <q-card-actions>
            <div class="align-center">
              <q-btn
                label="go to quest"
                absolute
                top>
              </q-btn>
            </div>
          </q-card-actions>
        </q-card>
      </div>
    </div>
    <div class="row">

    </div>
  </q-page>
</template>

<script>
import scoreboard from '../components/scoreboard.vue'
import { mapActions, mapState, mapGetters } from 'vuex'

export default {
  props: ["guild_id"],
  data () {
    return {
      columns1: [
        {
          name: 'desc',
          required: true,
          label: "Quest",
          align: "left",
          field: "name",
          sortable: true
        },
        {
          name: "status",
          required: false,
          label: "Handle",
          align: "left",
          field: "status",
          sortable: true
        },
        {
          name: "handle",
          required: false,
          label: "Status",
          align: "left",
          field: "handle",
          sortable: true
        },
        {
          name: "start",
          required: false,
          label: "Start Date",
          align: "left",
          field: "start",
          sortable: true
        },
        {
          name: "questNodeId",
          required: false,
          label: "Action",
          align: "left",
          field: "id",
          sortable: true
        }
      ],
      questGamePlay:[],
      guildMembership:null,
      members: [],
      guild: null,
      permission: false,
      userId: null,
      handles: [],
      label: '',
      quest: null,
      questId:null,
      currentQuest:null
    }
  },
  components: {
    "scoreboard": scoreboard

  },
  computed: {
    ...mapState('quests', {
      quests: state => state.quests
    }),
    ...mapState('user', {
      user: state => state.user
    }),
    ...mapState('guilds', {
      belongsTo: state => state.belongsTo
    }),
    ...mapGetters('quests', [
    'getQuestById'
    ]),
    ...mapGetters('guilds', [
    'getGuildById'
    ]),
  },
  methods: {
    ...mapActions('quests',['findQuests']),
    ...mapActions('user',['getUserById']),
    ...mapActions('guilds',[
      'findGuilds',
      'getMemberByGuildIdandUserId',
      'getMembersByGuildId',
      'registerQuest',
      'joinGuild',
      'getGamePlayByGuildId'
      ]),
    async doRegister(questId) {
      let payload = {
          guild_id: this.guildId,
          quest_id: questId
        }
      const registerResponse = await this.registerQuest(payload);
      await this.checkQuildGamePlay();
    },
    getCurrentQuest() {
      const thisQuest = this.getQuestById(this.questId);
      this.currentQuest = thisQuest[0];
      debugger;
    },
    async checkQuildGamePlay() {
      if (this.belongsTo.length === 1) {
      let gamePlay = await this.getGamePlayByGuildId(this.guildId);
      this.gamePlay=[...gamePlay];
      this.questGamePlay = this.gamePlay.map(q => {
        let qu = this.getQuestById(q.quest_id);
        let quId = qu[0];
        return quId;
      })

      const questResp = await Promise.all(gamePlay.map(async (player) => {
      try {
        const respUser = await this.getQuestById(player.quest_id);
        return respUser.data;
      }
      catch (error) {
        console.log("response error", error)
      }
      return questResp;
      }));
        this.quest = await this.getQuestById(gamePlay.quest_id);
    }
    },
    async joinGuild (guildId) {
      this.guildId = guildId;
      let ownGuilds = this.belongsTo;
      var r = ownGuilds.some(i => i.guild_id === this.guildId)
      if (!r) {
        await this.joinGuild(this.guildId);

        this.$q.notify({
          type: "positive",
          message: "You are joining guild " + this.guildId
        })
        } else {
          this.$q.notify({
          type: "positive",
          message: "You are already a member of " + this.guildId
        })
      }
    }
  },
    async mounted() {
    let guildId = this.$route.params.guild_id;
    const quests = [];
    this.quest = [];
    var payload = {guildId: guildId, userId: this.user.id};
    const response = this.getGuildById(guildId);
    this.guild = response[0];
    await this.joinGuild(guildId);
    this.guildMembership = await this.getMemberByGuildIdandUserId(payload);
    if (this.guildMembership[0].permissions && this.guildMembership[0].permissions.includes("guildAdmin")) {
      this.permission = true;
    };
    const guildMember = await this.getMembersByGuildId(this.guild.id);
    const resp = await Promise.all(guildMember.map(async (player) => {
      try {
        const respUser = await this.getUserById(player.user_id);
        return respUser.data;
      }
      catch (error) {
        console.log("response error", error)
      }
      return resp;
      }));
      //this.members = [...resp];
      for (var i = 0; i< resp.length; i++) {
        this.handles.push(resp[i][0].handle);
      }
      await this.checkQuildGamePlay();
    },
    async beforeMount() {
     const quests = await this.findQuests;
     const guilds = await this.findGuilds;
    }
  }
</script>

<style lang="styl">
.handles {
  font-size: 20px;
  font-family: pragmatica-web, sans-serif;
}
</style>