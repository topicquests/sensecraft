<template>
  <q-page class="bg-secondary">
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pt-lg q-pb-sm q-pl-md" style="width: 55%">
        <q-btn
          v-if="$store.state.member.member"
          id="newGuildBtn"
          label="New Guild"
          @click="$router.push({ name: 'create_guild' })"
        />
      </div>
    </div>
    <div class="column items-center">
      <div
        v-if="getGuilds && getGuilds.length"
        class="col-4 q-pa-md"
        style="width: 55%"
      >
        <guilds-table
          v-if="getMyGuilds.length"
          v-bind:guilds="getMyGuilds"
          v-bind:title="'My Guilds'"
          :edit="true"
        >
          <template v-slot:default="slotProps">
            <guilds-membership-indicator v-bind:guild="slotProps.guild" />
          </template>
        </guilds-table>
      </div>
      <div v-else class="column items-center q-mt-md">
        <h4>There are no guilds</h4>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapGetters, mapActions } from "vuex";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import { userLoaded } from "../boot/userLoaded";
import Component from "vue-class-component";
import Vue from "vue";
import { GuildsActionTypes, GuildsGetterTypes } from "src/store/guilds";
import { RoleActionTypes } from "src/store/role";
import GuildsTable from "../components/guilds-table.vue";
import GuildsMembershipIndicator from "../components/guilds-membership-indicator.vue";

@Component<GuildLandingPage>({
  components: {
    scoreboard: scoreboard,
    member: member,
    GuildsTable: GuildsTable,
    GuildsMembershipIndicator: GuildsMembershipIndicator,
  },

  computed: {
    ...mapGetters("guilds", ["getGuilds", "getMyGuilds"]),
  },
  methods: {
    ...mapActions("guilds", ["ensureAllGuilds"]),
    ...mapActions("role", ["ensureAllRoles"]),
  },
})
export default class GuildLandingPage extends Vue {
  serverPagination: {};
  serverData: [];

  getGuilds!: GuildsGetterTypes["getGuilds"];
  getMyGuilds!: GuildsGetterTypes["getMyGuilds"];

  ensureAllGuilds: GuildsActionTypes["ensureAllGuilds"];
  ensureAllRoles: RoleActionTypes["ensureAllRoles"];

  async beforeMount() {
    await userLoaded;
    await this.ensureAllGuilds();
    await this.ensureAllRoles();
  }
}
</script>

<style>
#newGuildBtn {
  margin-bottom: 4px;
  background-color: lightblue;
  color: blue;
}

#guildTable {
  color: blue;
  background-color: lightblue;
  font-family: Arial, Helvetica, sans-serif;
}
</style>
