<template>
  <q-page padding class="bg-secondary">
    <div >
       <q-card v-if = "permission">
        <q-table title="Quests" :data="getQuests" :columns="columns1" row-key = "desc">
         <template slot="body" slot-scope="props">
          <q-tr :props="props">
            <q-td key="desc" :props="props"> {{props.row.name}}</q-td>
            <q-td key="status" :props="props">{{props.row.status}}</q-td>
            <q-td key="label" :props="props">{{props.row.label}}</q-td>
            <q-td key="handle" :props="props">{{props.row.handle}}</q-td>
            <q-td key="questNodeId" auto-width :props="props">
              <q-btn label="Register" @click="doRegister(props.row.id)" class = "q-mr-md q-ml-md"/>
            </q-td>
          </q-tr>
        </template>
      </q-table>
     </q-card>
    </div>
    <div class="text-h4 text-center"> {{guild.name}} </div>
    <div v-if="quest" class="text-h4 text-center"> {{quest.name}} </div>

    <h5> Members</h5>
    <ul>
    <li v-for="handle in handles" :key="handle.handle">
      {{handle}}
    </li>
    </ul>
  </q-page>
</template>

<script>
export default {
    props: ["guild_id"],
    data () {
      return {
        columns1: [
        {
          name: 'desc',
          required: true,
          label: "Label",
          align: "left",
          field: "name",
          sortable: true
        },
        {
          name: "status",
          required: false,
          label: "Status",
          align: "left",
          field: "status",
          sortable: true
        },
        {
          name: "handle",
          required: false,
          label: "Handle",
          align: "left",
          field: "handle",
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
        members: [
        ],
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

    computed: {
      getQuests() {
      return  this.$store.getters['quests/getQuests'];
    },
    },

    methods: {
      async doRegister(questId) {
        let payload = {
          guild_id: this.guildId,
          quest_id: questId
          }
        const registerResponse = await this.$store.dispatch('guilds/registerQuest', payload)
        this.quest = await this.$store.dispatch('quests/getQuestById', questId);
        console.log("Quest name: ", this.quest.name);
        debugger;
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

    isCherries(fruit) {
  return fruit.permissions === 'guildAdmin';
  },



    async mounted() {

      let guildId = this.$route.params.guild_id;
      this.userId = this.$store.state.user.user.id;
      var payload = {guildId: guildId, userId: this.userId};
      const response = this.$store.getters['guilds/getGuildById'] (guildId);
       this.guild = response[0];
       await this.joinGuild(guildId);
       this.guildMembership = await this.$store.dispatch('guilds/getMemberByGuildIdandUserId', payload);
       if (this.guildMembership[0].permissions.includes("guildAdmin")) {
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
    },
    async beforeMount() {
     const quests = await this.$store.dispatch('quests/findQuests');
     console.log('find quests returns: ', quests);
     const guilds = await this.$store.dispatch('guilds/findGuilds');
     console.log('find guilds returns: ', guilds);
}
}
</script>