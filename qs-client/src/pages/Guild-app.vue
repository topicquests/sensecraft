<template>
   <q-page style ="background-color:lightgrey" >
     <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-md" style="width: 900px">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-md" style="width: 900px">
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
    <div class="column items-center">
      <div class="col-4 q-pa-md" style="width: 900px">
        <q-card class="bg-light-blue no-border">
          <div v-for="quest in questGamePlay" :key="quest.id">
            <q-radio v-model="questId" v-on:click.native="getCurrentQuest" color="black" style="font-size:20px" :val="quest.id" :label="quest.name"> </q-radio>
          </div>
        </q-card>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-md" style="width: 900px">
        <p style="text-align:center; font-size:40px"> {{currentGuild.name}}</p>
      </div>
    </div>
    <div class="row">
       <div class="col-12 col-md q-pa-md">
          <p style="text-align:center; font-size:20px">Team</p>
       </div>
       <div class="col-12 col-md q-pa-md">
         <p style="text-align:center; font-size:20px"> Quest Move</p>
        </div>
        <div class="col-12 col-md">
            <p style="text-align:center; font-size:20px">Current Quest</p>
        </div>
    </div>
    <div class="row">
      <div class="col-12 col-md">
        <q-card>
          <ul>
            <li v-for="member in members" :key="member.id">
              {{member.handle}}
            </li>
          </ul>
        </q-card>
      </div>
      <div class="col-12 col-md"></div>
      <div v-if="quest" class="col-12 col-md text-h6">
        <q-card>
          <q-card-section>
            <h6 v-if="currentQuest" style="text-align:center">
              {{currentQuest.name}}
            </h6>
          </q-card-section>
          <q-card-section >
              <div v-if="currentQuest" style="font-size:17px">
                <div v-html="currentQuest.description"></div>
              </div>
          </q-card-section>
          <div v-if = "this.currentQuest">
            <router-link :to="{ name: 'nodeEditor', params: { quest_id: this.currentQuest.id }}">Go To Quest</router-link>
          </div>
          <q-card-actions align="center">

              <q-btn
                label="go to quest"
                align="center"
                absolute
                top>
              </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import scoreboard from '../components/scoreboard.vue'
import member from '../components/member.vue'
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
      guildId: null,
      questGamePlay:[],
      guildMembership:null,
      members: [],
      permission: false,
      userId: null,
      label: '',
      quest: null,
      questId:null,
      currentQuest:null
    }
  },
  components: {
    "scoreboard": scoreboard,
    "member": member
  },
  computed: {
    ...mapState('quests', {
      quests: state => state.quests,
      currentQuest: state => state.currentQuest
    }),
    ...mapState('member', {
      member: state => state.member
    }),
    ...mapState('guilds', {
      belongsTo: state => state.belongsTo,
      currentGuild: state=> state.currentGuild
    }),
    ...mapGetters('quests', [
    'getQuestById'
    ]),
    ...mapGetters('guilds', [
    'getGuildById'
    ]),
  },
  methods: {
    ...mapActions('quests',[
      'findQuests',
      'getQuestById']),
    ...mapActions('member',['getUserById']),
    ...mapActions('guilds',[
      'findGuilds',
      'getMemberByGuildIdandUserId',
      'getGamePlayByGuildId',
      'getMembersByGuildId',
      'registerQuest',
      'joinGuild',
      'registerAllMembersToQuest',
      'setCurrentGuild'
      ]),
    async doRegister(questId) {
      let payload = {
          guild_id: this.guildId,
          quest_id: questId
        }

      const registerResponse = await this.registerQuest(payload);
        try {

          this.$q.notify({
          type: "positive",
          message: "You have registered to Quest "
          })
        }
        catch(err) {
          this.$q.notify({
          type: "negative",
          message: "There was an issue registering to Quest "
        })
        console.log("error registering to quest: ", err);
      }
        await this.checkQuildGamePlay();
          this.getQuestGamePlay();
          registerMembersToQuest (guild_id, quest_id);



    },
  async registerMembersToQuest (qstId) {
    let registerPayload = {
          guildid: this.guildId,
          questid: qstId,
    }
    const registerMembersResponse = await this.registerAllMembersToQuest(registerPayload);
  },
    getCurrentQuest() {
      const thisQuest = this.getQuestById(this.questId);
      this.currentQuest = thisQuest[0];
    },
    async getQuestGamePlay() {
      const gamePlay = await this.getGamePlayByGuildId(this.guildId);
      this.gamePlay=[...gamePlay];
      this.questGamePlay = this.gamePlay.map(q => {
        let qu = this.getQuestById(q.quest_id);
        let quId = qu[0];
        return quId;
      })
    },
    async checkQuildGamePlay() {
      this.getQuestGamePlay();
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
    },
    async joinToGuild () {
      let ownGuilds = this.belongsTo;
      var r = ownGuilds.some(i => i.guild_id === this.guildId)
      if (!r) {
        await this.joinGuild(this.guildId);
        this.questGamePlay = this.getQuestGamePlay()
        questGamePlay.forEach(element => {
          registerToQuest(element.quest_id)
        });
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
    const quests = [];
    this.quest = [];
    var payload = {guildId: this.guildId, userId: this.member.id};
    await this.joinToGuild(this.guildId);
    this.guildMembership = await this.getMemberByGuildIdandUserId(payload);
    if (this.guildMembership[0].permissions && this.guildMembership[0].permissions.includes("guildAdmin")) {
      this.permission = true;
    };
      await this.checkQuildGamePlay();
    },
    async beforeMount() {
      this.guildId = this.$route.params.guild_id;
      const quests = await this.findQuests;
      const guilds = await this.findGuilds;
      this.setCurrentGuild(this.guildId);
      const guildMember = await this.getMembersByGuildId(this.guildId);
      const resp = await Promise.all(guildMember.map(async (player) => {
        try {
          const respUser = await this.getUserById(player.member_id);
          return respUser.data;
        }
        catch (error) {
          console.log("response error", error)
        }
      return resp;
      }));
      for (var i = 0; i< resp.length; i++) {
        this.members.push(resp[i][0]);
      }
    }
  }
</script>

<style lang="styl">
.handles {
  font-size: 20px;
  font-family: pragmatica-web, sans-serif;
}

</style>