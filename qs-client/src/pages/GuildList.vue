<template>
  <q-page class="bg-grey-4">
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <guilds-table v-if="getGuilds && getGuilds.length"></guilds-table>
        <h5 v-else>There currently are no guilds</h5>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import scoreboard from "../components/scoreboard.vue";
import { mapGetters, mapActions } from "vuex";
import { userLoaded } from "../boot/userLoaded";
import GuildsTable from "../components/guilds-table.vue";
import { GuildsActionTypes, GuildsGetterTypes } from "../store/guilds";
import Component from "vue-class-component";
import Vue from "vue";

@Component<GuildListPage>({
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
})
export default class GuildListPage extends Vue {
  getGuilds!: GuildsGetterTypes["getGuilds"];
  ensureAllGuilds: GuildsActionTypes["ensureAllGuilds"];

  async beforeMount() {
    await userLoaded;
    await this.ensureAllGuilds();
  }
}
</script>
