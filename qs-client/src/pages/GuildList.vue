<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card style="width: 60%" class="q-mt-md">
        <div>
          <member></member>
        </div>
        <div class="column items-center">
          <div class="col-4" style="width: 100%">
            <scoreboard></scoreboard>
          </div>
        </div>
    <div class="column items-center">
      <div class="col-4" style="width: 100%">
        <div v-if="getGuilds.length">
            <guilds-table
              v-bind:guilds="getGuilds"
              v-bind:title="'Guilds'"
              v-bind:view="true"
            />
        </div>
        <h3 v-else>There currently are no guilds</h3>
      </div>
    </div>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import { mapGetters, mapActions } from "vuex";
import { userLoaded } from "../boot/userLoaded";
import GuildsTable from "../components/guilds-table.vue";
import { GuildsActionTypes, GuildsGetterTypes } from "../store/guilds";
import { MemberGetterTypes } from "../store/member";
import { RoleActionTypes } from "../store/role";
import { BaseGetterTypes } from "../store/baseStore";
import { Guild } from "../types";
import Component from "vue-class-component";
import Vue from "vue";
import { QuestsActionTypes } from "../store/quests";

@Component<GuildListPage>({
  meta: {
    title: "Guilds",
  },
  components: {
    scoreboard: scoreboard,
    member: member,
    GuildsTable: GuildsTable,
  },
  computed: {
    ...mapGetters("guilds", ["getGuilds", "getMyGuilds", "isGuildMember"]),
    ...mapGetters("member", ["getUserId"]),
    ...mapGetters(["hasPermission"]),
    /*
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
    */
  },
  methods: {
    ...mapActions("guilds", ["ensureAllGuilds", "setCurrentGuild"]),
    ...mapActions("quests", ["setCurrentQuest"]),
    ...mapActions("role", ["ensureAllRoles"]),
  },
})
export default class GuildListPage extends Vue {
  ready = false;
  getGuilds!: GuildsGetterTypes["getGuilds"];
  getMyGuilds!: GuildsGetterTypes["getMyGuilds"];
  isGuildMember!: GuildsGetterTypes["isGuildMember"];
  getUserId!: MemberGetterTypes["getUserId"];
  getOpenGuilds!: Guild[];
  getClosedGuilds!: Guild[];
  ensureAllGuilds: GuildsActionTypes["ensureAllGuilds"];
  setCurrentGuild: GuildsActionTypes["setCurrentGuild"];
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  hasPermission!: BaseGetterTypes["hasPermission"];
  ensureAllRoles: RoleActionTypes["ensureAllRoles"];

async beforeMount() {
    await userLoaded;
    await Promise.all([
      this.ensureAllGuilds(),
      await this.ensureAllRoles(),
      this.setCurrentGuild(null),
      this.setCurrentQuest(null),
    ]);
    this.ready = true;
  }
}
</script>
