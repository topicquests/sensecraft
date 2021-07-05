<template>
  <q-page padding class="bg-secondary">
    <div class="text-h4 text-center"> {{guild.name}} </div>

    <h5> Members</h5>
    <ul>
    <li v-for="member in guild.member" :key="member.memberId">
      <h5> {{member.handle}}</h5>
    </li>
    </ul>
  </q-page>
</template>

<script>
export default {
    props: ["guild_id"],
    data () {
      return {
        guild: {
        member: {
        id: null,
        handle: null,
        },
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
        label: ''
      }
    },

    computed: {

    },

    methods: {


    },

    async mounted() {

      let guildId = this.$route.params.guild_id;
      const response = this.$store.getters['guilds/getGuildById'] (guildId);
       this.guild = response[0];
       const guildMember = await this.$store.dispatch('guilds/getMembersByGuildId', this.guild.id)

      const resp = await Promise.all(guildMember.map(async (member) => {
        try {
        const resp = await this.$store.dispatch('user/getUserById', member.userId);
        return resp.data;
        }
        catch (error) {
          console.log("response error", error)
        }
      }));
      this.guild.member = resp.map(element =>  {
        let member = {
        handle:element.handle,
        id: element.id
      }
      return member})
      //member.id = resp.map(element =>  element.id)
      //this.guild.member = member.slice(0);
      console.log("Members ", this.guild.member);
      console.log("userResponse: ", guildMember);
      debugger;

    }
}
</script>