<template>
<q-layout view="hHh LpR fFf">
  <q-page padding class="bg-light-blue">
    <div class="row">
      <scoreboard></scoreboard>
    </div>
       <p style="text-align:center; font-size:40px"> {{guild.name}}</p>
    <div class="row">
      <div class ="col">
       <q-card v-if = "permission">
        <q-table title="Quests" :data="getQuests" :columns="columns1" row-key = "desc">
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
    <div class="col">
      <q-card class="bg-primary bordered: true q-mr-xl q-ml-xl text-xs-center">
        <div>
        <q-section class="q-pt-lg q-pb-xs">
          <h6 style="text-align:center"> {{quest.name}}</h6>
        </q-section>
        </div>
        <div class="handles">
        <q-section >
          <p style="text-align:center">{{quest.description}}</p>
        </q-section>
        </div>
        <div >
        <q-card-actions>
          <div class="align-center">
            <q-btn
              label="go to quest"
              absolute
              top>
          </q-btn>
          </div>
        </q-card-actions>
        </div>
      </q-card>
    </div>
    </div>
    <div class="row handles q-ml-lg q-mb-xs">
       Members
    </div>
    <div class="row q-mt-xs handles q-pr-xl">
      <div class="col">
      <ul>
        <li v-for="handle in handles" :key="handle.handle">
          {{handle}}
        </li>
      </ul>
    </div>

    </div>

    <div v-if="quest" class="q-mt-xl row text-h6">
      <q-radio v-model="quest" color="black" style="font-size:20px" label="quest.name"> </q-radio>
    </div>
  </q-page>
</q-layout>
</template>

<script>
import scoreboard from '../components/scoreboard.vue'
import { mapActions } from 'vuex'

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
      guildMembership:null,
      members: [],
      guild: {
        name: null,
        handle: null,
        open_for_applications: null,
        public: false,
        id: null,
        description: null,
        creator: null,
        createdAt: null,
        updatedAt: null
      },
      permission: false,
      userId: null,
      handles: [],
      label: '',
      quest: null,
    }
  },
  components: {
    "scoreboard": scoreboard

  },
  computed: {
    getQuests() {
      return  this.$store.getters['quests/getQuests'];
    },
  },
  methods: {
    ...mapActions('quests',['findQuests']),
    ...mapActions('guilds',['findGuilds']),
    async doRegister(questId) {
      let payload = {
          guild_id: this.guildId,
          quest_id: questId
        }
      const registerResponse = await this.$store.dispatch('guilds/registerQuest', payload)
      this.quest = await this.$store.dispatch('quests/getQuestById', questId);
    },
    async joinGuild (guildId) {
      this.guildId = guildId;
      let ownGuilds = this.$store.state.guilds.belongsTo;
      var r = ownGuilds.some(i => i.guild_id === this.guildId)
      if (!r) {
        await this.$store.dispatch('guilds/joinGuild', this.guildId)
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
    this.userId = this.$store.state.user.user.id;
    var payload = {guildId: guildId, userId: this.userId};
    const response = this.$store.getters['guilds/getGuildById'] (guildId);
    this.guild = response[0];
    await this.joinGuild(guildId);
    this.guildMembership = await this.$store.dispatch('guilds/getMemberByGuildIdandUserId', payload);
    if (this.guildMembership[0].permissions && this.guildMembership[0].permissions.includes("guildAdmin")) {
      this.permission = true;
    };
    const guildMember = await this.$store.dispatch('guilds/getMembersByGuildId', this.guild.id)
    const resp = await Promise.all(guildMember.map(async (player) => {
      try {
        const respUser = await this.$store.dispatch('user/getUserById', player.user_id);
        return respUser.data;
      }
      catch (error) {
        console.log("response error", error)
      }
      return resp;
      }));
      this.members = [...resp];
      for (var i = 0; i< resp.length; i++) {
        this.handles.push(resp[i][0].handle);
      }
      if (this.$store.state.guilds.belongsTo.length === 1) {
      let gamePlay = await this.$store.dispatch("guilds/getGamePlayByGuildId", guildId);

      const questResp = await Promise.all(gamePlay.map(async (player) => {
      try {
        const respUser = await this.$store.dispatch("quests/getQuestById", player.quest_id);
        return respUser.data;
      }
      catch (error) {
        console.log("response error", error)
      }
      return questResp;
      }));
        this.quest = await this.$store.dispatch('quests/getQuestById', gamePlay.quest_id);
      }
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