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
      <div class="col-4 q-pa-md" style="width: 900px">
        <q-card class="bg-light-blue no-border">
          <div v-if="activeQuests.length>0">
            <div v-for="quest in activeQuests" :key="quest.id">
            <q-radio v-model="currentQuestIdS" color="black" style="font-size:20px" :val="quest.id" :label="quest.name">
              <q-btn v-if="isMember && !findGuildOfCasting(quest.casting)" label="Play" @click="doAddCasting(quest.id)" style="margin-right: 1em" class="bg-dark-blue"/>
              <router-link  v-if="findGuildOfCasting(quest.casting) && findGuildOfCasting(quest.casting) != currentGuildId" :to="{ name: 'guild', params: { guild_id: findGuildOfCasting(quest.casting) }}" >Playing in guild</router-link>
            </q-radio>
            </div>
          </div>
          <div v-else>
            <p style="font-size: 20px">You are not registered to any quests</p>
          </div>
        </q-card>
      </div>
    </div>
      <div class="column items-center">
        <div class="col-4 q-pa-md" style="width: 900px" v-if="getCurrentGuild">
          <p style="text-align:center; font-size:40px"> {{getCurrentGuild.name}}
            <router-link  v-if="canRegisterToQuest" :to="{ name: 'guild_admin', params: { guild_id: currentGuildId }}" style="font-size: smaller">Admin</router-link>
          </p>
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
    <div class="row">
        <div class="col-12 col-md q-pa-md">
        <q-card>
          <ul  style="font-size:20px; color: red; background: lightblue;">
            <li v-for="member in members" :key="member.id" >
              {{member.handle}}
            </li>
          </ul>
        </q-card>
      </div>
      <div class="col-12 col-md q-pa-md">
        <div v-if = "selectedNode" class="col-12 col-md q-pa-md">
        <q-card  class="q-pa-md" id="node_card">
            <q-input
              v-model='selectedNode.title'
              label = "Parent Node"
              style="color: darkblue"/>
              <q-input
              v-model="selectedNode.node_type"
              label = "Type"
              style="font-size:17px;
                      color: darkblue;"/>
            Details<br/>
          <div v-html="selectedNode.description" style="font-size:17px;"></div>
        </q-card>
        </div>
      </div>
      <div class="col-12 col-md q-pa-md" style="width:200%;" v-if="getCurrentQuest">
        <div>
            <questCard v-bind:currentQuestCard ="getCurrentQuest" style="width: 100%" :creator="getQuestCreator()" v-if="getCurrentQuest"></questCard>
        </div>
      </div>
    </div>
    <div v-if="getCurrentQuest" class="col-12 col-md q-pa-md">
        <div v-if = "this.getCurrentQuest" align="center">
          <router-link :to="{ name: 'game_play', params: { quest_id: this.getCurrentQuest.id }}">Go To Quest</router-link>
        </div>
    </div>

   <div class="column items-center" v-if="pastQuests.length > 0">
      <div class="col-4" style="width: 900px">
        <q-card>
          <q-table title="Past Quests" :data="pastQuests" :columns="columns1" row-key = "desc" id="quest_table">
            <template slot="body" slot-scope="props">
              <q-tr :props="props">
                <q-td key="desc" :props="props"> {{props.row.name}}</q-td>
                <q-td key="handle" :props="props">{{props.row.handle}}</q-td>
                <q-td key="status" :props="props">{{props.row.status}}</q-td>
                <q-td key="end" :props="props">{{props.row.end}}</q-td>
                <q-td key="questNodeId" auto-width :props="props">
                  <router-link :to="{ name: 'questview', params: { quest_id:  props.row.id }}" >Enter</router-link>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>

  </q-page>

</template>

<script>
import scoreboard from '../components/scoreboard.vue'
import member from '../components/member.vue'
import questCard from '../components/quest-card.vue'
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
      memberPlaysQuestSomewhere: false,
      memberPlaysQuestInThisGuild: false,
      casting: null,
      guildGamePlays: [],
      pastQuests: [],
      activeQuests: [],
      potentialQuests: [],
      questGamePlay:[],
      isMember: false,
      isAdmin: false,
      canRegisterToQuest: false,
      members: [],
      label: '',
      questId:null,
      gamePlay: null,
      selectedNode: null,
      focusNode: null,
    }
  },
  components: {
    "scoreboard": scoreboard,
    "member": member,
    "questCard": questCard,
  },
  computed: {
    ...mapState('quests', {
      currentQuestId: state => state.currentQuest,
      "questCard": questCard,
    }),
    currentQuestIdS: {
      get: function() { return this.currentQuestId },
      set: function(value) { this.setCurrentQuest(value) }
    },
    ...mapGetters('quests', [
      'getQuestById',
      'getQuests',
      'getCurrentQuest',
    ]),
    ...mapState('member', {
      member: state => state.member,
      memberId: state => state.member?.id
    }),
    ...mapState('guilds', {
      currentGuildId: state=> state.currentGuild,
    }),
    ...mapGetters("members", [
     "getMemberById",
    ]),
    ...mapGetters('guilds', [
      'isGuildMember',
      'getGuildById',
      'getCurrentGuild',
    ]),
    ...mapState('conversation', {
      nodes: state => state.neighbourhood,
      rootNode: state => state.conversationRoot,
    }),
    ...mapGetters(['hasPermission']),
  },
  watch: {
    currentQuestId: 'onCurrentQuestChange',
  },
  methods: {
    ...mapActions('conversation', [
      'fetchConversationNeighbourhood',
      'fetchRootNode'
    ]),
    ...mapActions('quests',[
      'ensureAllQuests',
      'setCurrentQuest',
      'addCasting',
      "fetchQuestById",
    ]),
    ...mapActions('members',['fetchUserById']),
    // ...mapGetters('member', ['getUserId']),
    ...mapActions('guilds',[
      'ensureGuild',
      'getMemberByGuildIdandUserId',
      'getGamePlayByGuildIdAndQuestId',
      'getGamePlayByGuildId',
      'getMembersByGuildId',
      'registerQuest',
      'joinGuild',
      'setCurrentGuild',
      'setFocusNodeId',
    ]),
    async initialize() {
      await this.setCurrentGuild(this.guildId);
      // Do we know the person wants to join the guild,
      // vs just curious about it?
      // TODO: Put this in a button.
      // if(this.checkIfGuildMember() == false) {
      //   await this.joinToGuild();
      // }
      this.checkPermissions();
      // should be useful but unused for now
      // const memb = await this.getGuildMembers();
      const playQuestIds = this.getCurrentGuild.game_play.map(gp=>gp.quest_id);
      this.guildGamePlays = this.getCurrentGuild.game_play.filter(gp => gp.status == 'confirmed');
      const confirmedPlayQuestIds = this.guildGamePlays.map(gp=>gp.quest_id);
      if (this.canRegisterToQuest) {
        this.potentialQuests = this.getQuests.filter(q => (q.status == 'registration' || q.status == 'ongoing') && !confirmedPlayQuestIds.includes(q.id));
      }
      this.pastQuests = this.getQuests.filter(q => (q.status == 'finished' || q.status == 'scoring') && playQuestIds.includes(q.id));
      this.activeQuests = this.getQuests.filter(q => (q.status == 'ongoing' || q.status == 'paused' || q.status == 'registration') && confirmedPlayQuestIds.includes(q.id));

      if (this.guildGamePlays.length > 0) {
        const response = await this.initializeQuest();
      }
    },
    async initializeQuest() {
      var quest_id = this.currentQuestId;
      if (quest_id && !this.guildGamePlays.find(gp => gp.quest_id == quest_id)) {
        quest_id = null;
      }
      if (!quest_id) {
        const gamePlay = this.guildGamePlays[0];
        await this.setCurrentQuest(gamePlay.quest_id);
      }
      // TODO: figure out why is this not triggered reliably by the watch and the change above?
      this.onCurrentQuestChange();
    },
    async onCurrentQuestChange() {
      // we should not get here without a current quest
      const quest = this.getCurrentQuest;
      await this.fetchUserById({params: {id: quest.creator}})
      const casting = quest.casting?.find(ct => ct.user_id == this.memberId);
      if (casting) {
        this.memberPlaysQuestSomewhere = casting.guild_id;
        if (casting.guild_id == this.currentGuildId) {
          this.memberPlaysQuestInThisGuild = true;
          this.casting = casting;
        }
      }
      const guild = this.currentGuildId;
      const gamePlay = this.findPlayOfGuild(quest.game_play);
      var node_id = gamePlay.focus_node_id;
      if (!node_id) {
        await this.fetchRootNode({params: {quest_id: this.currentQuestId}});
        node_id = this.rootNode?.id;
      }
      if (node_id) {
        await this.fetchConversationNeighbourhood({params: {guild, node_id}});
        this.focusNode = this.nodes.find(n => n.id == node_id);
        this.selectedNode = this.focusNode;
      } else {
        // ill-constructed quest
        this.focusNode = null;
        this.selectedNode = null;
        this.$store.commit('RESET_CONVERSATION');
      }
      return "success";
    },

    async joinToGuild () {
      await this.joinGuild(this.currentGuildId);
      this.registerMembersToGuild();
      this.$q.notify({
        type: "positive",
          message: "You are joining guild " + this.currentGuildId
      })
      return
    },
    async registerAllMembersToQuest () {
      // This was a temporary fix, let's not do this too often.
      const guild_id = this.currentGuildId;
      const registerAllMembers = this.registerAllMembers;
      const calls = this.getCurrentGuild.game_play.filter(
          gp=>gp.status == 'confirmed').map(
            gp => registerAllMembers({params:{ guild_id , quest_id: gp.quest_id}}));
      await Promise.all(calls);
    },
    findPlayOfGuild(gamePlays) {
      if (gamePlays)
        return gamePlays.find(gp => gp.guild_id == this.currentGuildId);
    },
    findGuildOfCasting(castings) {
      if (castings)
        return castings.find(ct => ct.member_id == this.memberId)?.guild_id;
    },
    doAddCasting(quest_id) {
      this.addCasting({data: {
        quest_id, guild_id: this.currentGuildId, member_id: this.memberId}});
    },
    checkPermissions() {
      this.isMember = this.isGuildMember(this.currentGuildId);
      if (this.isMember) {
        this.isAdmin = this.hasPermission('guildAdmin', this.currentGuildId);
        this.canRegisterToQuest = this.hasPermission('joinQuest', this.currentGuildId);
      }
    },
    show_tree(show) {
      this.$store.commit('conversation/SHOW_TREE', show);
    },
    async getGuildMembers() {
      const guildMembers = await this.getMembersByGuildId(this.currentGuildId);
      const resp = await Promise.all(guildMembers.map(async (player) => {
        try {
          const respUser = await this.fetchUserById(player.member_id);
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
    async getPlayedQuests() {
      const play = this.guildGamePlays;
      return play.map(gp => this.getQuestById(gp.quest_id));
    },
    async getParentsNode() {
      const nodeId = this.gamePlay[0].focus_node_id;
      if (nodeId) {
        const selectedNode = await this.getParentNode(nodeId);
        return selectedNode;
      }
      return
    },
    async setFocusNode() {
      let payload = {
          guild_id: this.currentGuildId,
          quest_id: this.questId
      }
      const conv = await this.setConversationQuest(payload.quest_id);
      const gpResponse = await this.getGamePlayByGuildIdAndQuestId(payload);
      gpResponse[0].focus_node_id = conv[0].id;
      const focus = await this.setFocusNodeId(gpResponse[0]);
      const game_play = await this.getGamePlayByGuildIdAndQuestId(payload);
      this.gamePlay = [...game_play];
      return "focus node set"
    },
    async doRegister(questId) {
      try {
        this.questId = questId;
        const regQuest = await this.getQuestById(questId);
        if (regQuest[0].status === "draft") {
          throw "Can not register quest in draft status"
        }
        let payload = {
          guild_id: this.currentGuildId,
          quest_id: questId
        }
        const registerResponse = await this.registerQuest(payload);
        await this.registerMembersToGuild();
        await this.setFocusNode();
        const response = await this.initializeQuest();
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
    getQuestCreator() {
      const quest = this.getCurrentQuest;
      if (quest) {
        return this.getMemberById(quest.creator);
      }
    },
  },
  async beforeMount() {
    this.guildId = this.$route.params.guild_id;
    await this.ensureAllQuests();
    await this.ensureGuild(this.guildId);
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


</style>