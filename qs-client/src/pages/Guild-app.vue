<template>
   <q-page style ="background-color:lightgrey" >
     <div>
      <member></member>
    </div>
    <div class="column items-center q-mb-md">
      <div class="col-4" id="scoreboard">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4" style="width: 900px">
        <q-card v-if = "permission">
          <q-table title="Quests" :data="quests" :columns="columns1" row-key = "desc" id="quest_table">
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
          <div v-if="questGamePlay.length>0">
            <div v-for="quest in questGamePlay" :key="quest.id">
            <q-radio v-model="questId" v-on:click.native="getCurrentQuest" color="black" style="font-size:20px" :val="quest.id" :label="quest.name"> </q-radio>
            </div>
          </div>
          <div v-else>
            <p style="font-size: 20px">You are not registered to any quests</p>
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
        <div class="col-12 col-md q-pa-md">
            <p style="text-align:center; font-size:20px">Current Quest</p>
        </div>
    </div>
    <div class="row ">
        <div class="col-12 col-md q-pa-md">
        <q-card>
          <ul  style="font-size:20px; color: red; background: lightblue;">
            <li v-for="member in members" :key="member.id" >
              {{member.handle}}
            </li>
          </ul>
        </q-card>
      </div>
      <div v-if = "parentNode" class="col-12 col-md q-pa-md">
        <q-card  class="q-pa-md" id="node_card">
            <q-input
              v-model='parentNode.title'
              label = "Parent Node"
              style="color: darkblue"/>
              <q-input
              v-model="parentNode.node_type"
              label = "Type"
              style="font-size:17px;
                      color: darkblue;"/>
            Details<br/>
          <div v-html="parentNode.description" style="font-size:17px;"></div>
        </q-card>
      </div>
      <div v-if="quest" class="col-12 col-md q-pa-md">
        <q-card id="quest_card">
          <q-card-section>
            <h6 v-if="currentQuest" style="text-align:center; color: darkgreen;">
              {{currentQuest.name}}
            </h6>
          </q-card-section>
          <q-card-section >
              <div v-if="currentQuest" style="font-size:17px">
                <div v-html="currentQuest.description"></div>
              </div>
          </q-card-section>
          <div v-if = "this.currentQuest" align="center">
            <router-link :to="{ name: 'nodeEditor', params: { quest_id: this.currentQuest.id }}">Go To Quest</router-link>
          </div>
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
      label: '',
      quest: [],
      questId:null,
      gamePlay: null
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
      currentGuild: state=> state.currentGuild,
      gamePlay: state => state.gamePlay
    }),
    ...mapState('conversation', {
      parentNode: state => state.parentNode
    }),
    ...mapGetters('quests', [
    'getQuestById'
    ]),
    ...mapGetters('guilds', [
    'getGuildById'
    ]),
    ...mapGetters('conversation', [
      'getFirstNode'
    ])
  },
  methods: {
    ...mapActions('conversation', [
      'getConversationByQuestId',
      'getParentNode'
    ]),
    ...mapActions('quests',[
      'findQuests',
      'getQuestById',
      'setCurrentQuest']),
    ...mapActions('member',['getUserById']),
    ...mapActions('guilds',[
      'findGuilds',
      'getMemberByGuildIdandUserId',
      'getGamePlayByGuildIdAndQuestId',
      'getGamePlayByGuildId',
      'getMembersByGuildId',
      'registerQuest',
      'joinGuild',
      'registerAllMembersToQuest',
      'setCurrentGuild',
      'setFocusNodeId',
      'checkCasting'
      ]),
    async initialize() {
      await this.setCurrentGuild(this.guildId);
      if(this.checkIfGuildMember() == false) {
        await this.joinToGuild();
      }
      this.checkIfGuildAdmin();
      const memb = await this.getGuildMembers();
      const hasQuests = await this.checkGuildHasQuests();
      if(hasQuests) {
        const response = await this.initializeQuest();
      }
    },
     async initializeQuest() {
      let quests = [];
      quests = await this.getQuests();
      let thisQuest = quests[0];
      this.questId = thisQuest.id;
      this.getCurrentQuest()
      await this.setFocusNode();
      const node = await this.getParentsNode();
      console.log("Parent Node", this.parentNode);
      const response = await this.checkGuildGamePlay();
      return "success";
    },
    checkIfGuildMember() {
      let ownGuilds = this.belongsTo;
      var guildMember = ownGuilds.some(i => i.guild_id === this.guildId)
      if (!guildMember) {
        return false
      } else {
        this.$q.notify({
          type: "positive",
          message: "You are already a member of " + this.guildId
        })
        return true;
      }
    },

    async joinToGuild () {
      await this.joinGuild(this.guildId);
      this.registerMembersToQuest();
      this.$q.notify({
        type: "positive",
          message: "You are joining guild " + this.guildId
      })
      return
    },
    async registerMembersToQuest () {
        let registerToQuest = this.registerQuest;
        const game_play = await this.getGamePlay()
        game_play.forEach(async element => {
        registerToQuest(element.quest_id);
         if (checkCasting(element.quest_id) == true) {
          let registerPayload = {
            guildid: this.guildId,
            questid: element.quest_id,
      }
          const registerMembersResponse = await this.registerAllMembersToQuest(registerPayload);
         }
        });
    },
    async checkCasting(quId) {
      let param = {
        quest_id: quId,
        guild_id: this.guildId,
        member_id: this.member.id
      }
      const casting = await this.checkCasting(param)
      if(casting.length > 0) {
        return false
      } else {
        return true
      }
    },
    async checkIfGuildAdmin() {
      var payload = {guildId: this.guildId, userId: this.member.id};
      this.guildMembership = await this.getMemberByGuildIdandUserId(payload);
      if (this.guildMembership[0].permissions && this.guildMembership[0].permissions.includes("guildAdmin")) {
        this.permission = true;
        return true;
      }
      return false;
    },
    show_tree(show) {
      this.$store.commit('conversation/SHOW_TREE', show);
    },
    async getGuildMembers() {
      const guildMembers = await this.getMembersByGuildId(this.guildId);
      const resp = await Promise.all(guildMembers.map(async (player) => {
        try {
          const respUser = await this.getUserById(player.member_id);
          return respUser.data;
        }
        catch (error) {
          console.log("response error", error)
        }
      }));
      for (var i = 0; i< resp.length; i++) {
        this.members.push(resp[i][0]);
      }
      return resp;
    },
    async checkGuildHasQuests() {
      const play = await this.getGamePlay();
      if (play.length > 0) {
        return true;
      } else {
        return false;
      }
    },
    async getQuests() {
      const play = await this.getGamePlay();
      let questPlay = [];
      let thisQuest;
      if(play.length > 0) {
        this.gamePlay=[...play];
        questPlay = this.gamePlay.map(q => {
          let qu = this.getQuestById(q.quest_id);
          let quId = qu[0];
          return quId;
        })
        this.questGamePlay=[...questPlay];
        thisQuest=questPlay[0];
        this.questId = thisQuest.id;
        this.getCurrentQuest();
        return questPlay;
      }
    },
    async getParentsNode() {
      const nodeId = this.gamePlay[0].focus_node_id;
      const parentNode = await this.getParentNode(nodeId);
      return parentNode;
    },
    async getCurrentQuest() {
      const thisQuest = this.getQuestById(this.questId);
      const cq = await this.setCurrentQuest(this.questId);
      const gp = await this.setGamePlay();
      const response = await this.setConversationQuest(this.currentQuest.id);
      const node = await this.getParentsNode();
    },
    async setConversationQuest(id) {
      const convResponse = await this.getConversationByQuestId(id);
      return convResponse;
    },
    async getGamePlay() {
      const game_play = await this.getGamePlayByGuildId(this.guildId);
        try {
          return game_play;
        }
        catch(err) {

        }
    },
    async checkGuildGamePlay() {
     let thisGamePlay = await this.getGamePlay();
      const questResp = await Promise.all(thisGamePlay.map(async (player) => {
      try {
        const respUser = await this.getQuestById(player.quest_id);
        return respUser.data;
      }
      catch (error) {
        console.log("response error", error)
      }
      return questResp;
      }));
     //   this.quest = await this.getQuestById(thisGamePlay.quest_id);
    },
    async setGamePlay() {
      let payload = {
        quest_id: null,
        guild_id: null
      };
      payload.quest_id = this.currentQuest.id;
      payload.guild_id = this.guildId;
      const game_play =  await this.getGamePlayByGuildIdAndQuestId(payload)
      this.gamePlay = game_play;
      return game_play;
    },
    async setFocusNode() {
      let payload = {
          guild_id: this.guildId,
          quest_id: this.questId
        }
      const conv = await this.setConversationQuest(payload.quest_id);
      const gpResponse = await this.getGamePlayByGuildIdAndQuestId(payload);
      gpResponse[0].focus_node_id = conv[0].id;
      const focus = await this.setFocusNodeId(gpResponse[0]);
      const game_play = await this.getGamePlayByGuildIdAndQuestId(payload);
      this.gamePlay = [...game_play];
      const response = await this.getQuests();
      return "focus node set"
    },
    getConversationNode(questId) {
      let guildId = null;
      nodeId = getFirstNode(questId, guildId);
    },
    async doRegister(questId) {
      try {
        this.questId = questId;
        const regQuest = await this.getQuestById(questId);
        if (regQuest[0].status === "draft") {
          throw "Can not register quest in draft status"
        }
        let payload = {
          guild_id: this.guildId,
          quest_id: questId
        }
        const registerResponse = await this.registerQuest(payload);
        this.registerMembersToQuest();
        const hasQuests = await this.checkGuildHasQuests();
      if(hasQuests) {
        const response = await this.initializeQuest();
      }
        this.$q.notify({
          type: "positive",
          message: "You have registered to Quest "
          })
        }
        catch(e) {
          this.$q.notify({
          type: "negative",
          message: `${e}`
        })
        console.log("error registering to quest: ", err);
      }
    },
  },
    async beforeMount() {
      this.guildId = this.$route.params.guild_id;
      const quests = await this.findQuests();
      const guilds = await this.findGuilds();
      this.initialize();
    },
  }
</script>

<style>
.handles {
  font-size: 20px;
  font-family: pragmatica-web, sans-serif;
}
#quest_card {
  border: 3px solid black;
  font-size: 10pt;
  color:darkgreen;
  height: 400px;
}
#node_card {
  border: 3px solid black;
  font-size: 10pt;
  color:darkblue;
  height: 400px;
}
#scoreboard {
  width: 900px;
  border: 1px solid blue;}

</style>