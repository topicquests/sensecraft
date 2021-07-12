<template>
  <q-page padding class="bg-secondary">
    <div class="text-h4 text-center"> {{guild.name}} </div>
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
        handles: [],
        label: ''
      }
    },

    computed: {

    },

    methods: {
      log(item) {
        console.log(item)
        debugger;
      }
    },

    async mounted() {

      let guildId = this.$route.params.guild_id;
      const response = this.$store.getters['guilds/getGuildById'] (guildId);
       this.guild = response[0];
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
          console.log("resp: ", resp[i][0].handle)
          console.log("length members ", this.members.length)
        }
         debugger;
    },

    async beforeMount() {
     const quests = await this.$store.dispatch('quests/findQuests');
     console.log('find quests returns: ', quests);
     const guilds = await this.$store.dispatch('guilds/findGuilds');
     console.log('find guilds returns: ', guilds);
  }
}
</script>