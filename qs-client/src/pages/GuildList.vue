<template>
 <q-page class="bg-secondary">
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 1000px">
        <div v-if="getGuilds.length">
          <div v-if="getUserId">
            <guilds-table
              v-if="getMyGuilds.length"
              v-bind:guilds="getMyGuilds"
              v-bind:title="'My Guilds'"
            >
              <template v-slot:default="slotProps">
                <guilds-membership-indicator v-bind:guild="slotProps.guild" />
              </template>
            </guilds-table>
            <guilds-table
              v-if="getOpenGuilds.length"
              v-bind:guilds="getOpenGuilds"
              v-bind:title="'Open Guilds'"
            >
              <template v-slot:default="slotProps">
                <guilds-membership-indicator v-bind:guild="slotProps.guild" />
              </template>
            </guilds-table>
            <guilds-table
              v-if="getClosedGuilds.length"
              v-bind:guilds="getClosedGuilds"
              v-bind:title="'Closed Guilds'"
            >
              <template v-slot:default="slotProps">
                <guilds-membership-indicator v-bind:guild="slotProps.guild" />
              </template>
            </guilds-table>
          </div>
          <div v-else>
            <guilds-table
              v-bind:guilds="getGuilds"
              v-bind:title="'Guilds'"
            ></guilds-table>
          </div>
        </div>
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
import { MemberGetterTypes } from "../store/member";
import { Guild } from "../types";
import Component from "vue-class-component";
import Vue from "vue";
import GuildsMembershipIndicator from "../components/guilds-membership-indicator.vue";

@Component<GuildListPage>({
  meta: {
    title: "Guild List"
  },
  components: {
    scoreboard: scoreboard,
    GuildsTable: GuildsTable,
    GuildsMembershipIndicator: GuildsMembershipIndicator,
  },
  computed: {
    ...mapGetters("guilds", ["getGuilds", "getMyGuilds", "isGuildMember"]),
    ...mapGetters("member", ["getUserId"]),
    getOpenGuilds: {
      get() {
        return this.getGuilds.filter(
          (guild) =>
            guild.open_for_applications && !this.isGuildMember(guild.id)
        );
      },
    },
    getClosedGuilds: {
      get() {
        return this.getGuilds.filter(
          (guild) =>
            !guild.open_for_applications && !this.isGuildMember(guild.id)
        );
      },
    },
  },
  methods: {
    ...mapActions("guilds", ["ensureAllGuilds"]),
  },
})
export default class GuildListPage extends Vue {
  getGuilds!: GuildsGetterTypes["getGuilds"];
  getMyGuilds!: GuildsGetterTypes["getMyGuilds"];
  isGuildMember!: GuildsGetterTypes["isGuildMember"];
  getUserId!: MemberGetterTypes["getUserId"];
  getOpenGuilds!: Guild[];
  getClosedGuilds!: Guild[];
  ensureAllGuilds: GuildsActionTypes["ensureAllGuilds"];
  async beforeMount() {
    await userLoaded;
    await this.ensureAllGuilds();
  }
}
</script>
