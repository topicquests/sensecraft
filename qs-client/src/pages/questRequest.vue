<template>
  <q-page padding>
   <div class="q-pa-md">
    <div class="q-gutter-sm">
        <div v-for="guild in guilds" v-bind:data="guild" v-bind:key="guild.name">
          <q-checkbox
          v-model="guild[0].check"
          :val="guild[0].check"
          :value="true"
          :checked="true"
          :label="guild[0].name"
          :name="guild[0].handle"
          v-on:click.native="toggleCheckbox(guild[0])"
          />
        </div>
         </div>
   </div>

    <div class="q-px-sm">
    </div>    <!-- content -->
  </q-page>
</template>

<script>
import { ref } from 'vue'
export default {
  data() {
    return {
      quest: null,
      guilds: null,
      userId: null,
      val: false,
      columns: [
        {
          name: 'desc',
          required: true,
          label: "Label",
          align: "left",
          field: "name",
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
          name: "public",
          required: false,
          label: "Public",
          align: "left",
          field: "public",
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
          name: "date",
          required: true,
          label: "Date",
          align: "left",
          field: "created_at",
          sortable: true
        },
        {
          name: "nodeId",
          required: false,
          label: "Action",
          align: "left",
          field: "id",
          sortable: true
        }
      ]
    }
  },

  methods: {
    joinQuest(quest) {

    },
    toggleCheckbox: function(guild) {
    }

  },

  async mounted() {
    let questId = this.$route.params.quest_id;
    this.userId = this.$store.state.member.member.id;
    const memberGuilds = await this.$store.dispatch('guilds/checkBelongsToGuild', this.userId)

    const resp = await Promise.all(memberGuilds.data.map(async (guild) => {
        try {
        const respGuild = await this.$store.dispatch('guilds/getGuildById', guild.guild_id);
        respGuild[0].check = false;
        return respGuild;

        }
        catch (error) {
          console.log("response error", error)
        }
        return resp;
      }));

      this.guilds = [...resp];
  }
  // name: 'PageName',
}
</script>
