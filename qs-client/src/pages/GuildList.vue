<template>
  <q-page class="bg-grey-4">
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <guilds-table></guilds-table>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import scoreboard from "../components/scoreboard.vue";
import { mapGetters, mapActions } from "vuex";
import { userLoaded } from "../boot/userLoaded";
import GuildsTable from "../components/guilds-table.vue";

export default {
  props: ["member"],
  data() {
    return {
      columns: [
        {
          name: "desc",
          required: true,
          label: "Label",
          align: "left",
          field: "name",
          sortable: true,
        },
        {
          name: "handle",
          required: false,
          label: "Handle",
          align: "left",
          field: "handle",
          sortable: true,
        },
        {
          name: "public",
          required: false,
          label: "Public",
          align: "left",
          field: "public",
          sortable: true,
        },
        {
          name: "date",
          required: true,
          label: "Date",
          align: "left",
          field: "created_at",
          sortable: true,
        },
        {
          name: "nodeId",
          required: false,
          label: "Action",
          align: "left",
          field: "id",
          sortable: true,
        },
      ],
    };
  },
  components: {
    scoreboard: scoreboard,
    GuildsTable: GuildsTable,
  },
  computed: {
    ...mapGetters("guilds", ["getGuilds"]),
    guildList() {
      return this.getGuilds;
    },
  },
  methods: {
    ...mapActions("guilds", ["ensureAllGuilds"]),
  },

  async beforeMount() {
    await userLoaded;
    await this.ensureAllGuilds();
  },
};
</script>
