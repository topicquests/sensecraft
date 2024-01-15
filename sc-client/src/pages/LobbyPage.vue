<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card class="lobby-card q-mt-md q-pa-md">
        <div>
          <member></member>
        </div>
        <div class="column items-center">
          <div class="col-12 q-mb-md scoreboard">
            <scoreboard></scoreboard>
          </div>
        </div>
        <div class="column items-center">
          <div v-if="getActiveQuests.length" style="width: 100%">
            <quest-table
              v-bind:quests="getActiveQuests"
              title="Active Quests"
            />
            <q-btn :to="{ name: 'quest_list' }">All Quests</q-btn>
          </div>
          <div v-else-if="getQuests.length" class="col-6" style="width: 100%">
            <quest-table v-bind:quests="getQuests" title="Quests" />
          </div>
          <div v-else class="column items-center q-mt-md">
            <h4>There are no quests</h4>
          </div>
        </div>
        <div class="column items-center">
          <div class="col-4" style="width: 100%">
            <div v-if="getMyGuilds.length">
              <guilds-table
                v-bind:guilds="getMyGuilds"
                v-bind:title="'My Guilds'"
              />
              <q-btn :to="{ name: 'guild_list' }">All Guilds</q-btn>
            </div>
            <div v-else-if="getOpenGuilds.length">
              <guilds-table
                v-bind:guilds="getOpenGuilds"
                v-bind:title="'Open Guilds'"
              />
              <p v-if="getUserId">Consider joining one of these guilds!</p>
              <p v-else>Register and join one of these guilds!</p>
              <q-btn
                v-if="getOpenGuilds.length < getGuilds.length"
                :to="{ name: 'guild_list' }"
                >All Guilds</q-btn
              >
            </div>
            <div v-else-if="getGuilds.length">
              <guilds-table v-bind:guilds="getGuilds" v-bind:title="'Guilds'" />
              <p>No guild is recruiting right now</p>
            </div>
            <h4 v-else style="text-align: center">
              There are currently no guilds
            </h4>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import scoreboard from "../components/scoreboard.vue";
import questTable from "../components/quest-table.vue";
import GuildsTable from "../components/guilds-table.vue";
import member from "../components/member.vue";
import { Guild } from "../types";
import { mapActions, mapGetters } from "vuex";
import { QuestsActionTypes, QuestsGetterTypes } from "src/store/quests";
import { GuildsActionTypes, GuildsGetterTypes } from "src/store/guilds";
import { MemberGetterTypes } from "src/store/member";
import { userLoaded } from "../boot/userLoaded";
import Component from "vue-class-component";
import Vue from "vue";
import GuildsMembershipIndicator from "../components/guilds-membership-indicator.vue";

@Component<LobbyPage>({
  name: "LobbyPage",
  meta: {
    title: "Dashboard",
  },
  components: {
    scoreboard: scoreboard,
    questTable: questTable,
    member: member,
    GuildsTable: GuildsTable,
    GuildsMembershipIndicator: GuildsMembershipIndicator,
  },
  computed: {
    ...mapGetters("guilds", ["getGuilds", "getMyGuilds", "isGuildMember"]),
    ...mapGetters("quests", ["getQuests", "getActiveQuests"]),
    ...mapGetters("member", ["member", "getUserId"]),

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
    ...mapActions("quests", ["ensureAllQuests", "setCurrentQuest"]),
    ...mapActions("guilds", ["ensureAllGuilds", "setCurrentGuild"]),
  },
})
export default class LobbyPage extends Vue {
  ready = false;

  getOpenGuilds!: Guild[];
  getClosedGuilds!: Guild[];

  getMyGuilds!: GuildsGetterTypes["getMyGuilds"];
  getQuests!: QuestsGetterTypes["getQuests"];
  getActiveQuests!: QuestsGetterTypes["getActiveQuests"];
  getGuilds!: GuildsGetterTypes["getGuilds"];
  getUserId!: MemberGetterTypes["getUserId"];

  // declare the methods for Typescript
  setCurrentGuild: GuildsActionTypes["setCurrentGuild"];
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  ensureAllQuests: QuestsActionTypes["ensureAllQuests"];
  ensureAllGuilds: GuildsActionTypes["ensureAllGuilds"];

  async beforeMount() {
    await userLoaded;
    // all guilds and quests
    await this.setCurrentGuild(true);
    await this.setCurrentQuest(true);
    await Promise.all([this.ensureAllQuests(), this.ensureAllGuilds()]);
    this.ready = true;
  }
}
</script>
<style>
p {
  background-color: lightgrey;
  font-size: 15pt;
}

.lobby-card {
  width: 60%;
}

.scoreboard {
  width: 75%;
}

@media only screen and (max-width: 1300px) {
  .lobby-card {
    width: 80%;
  }
}

@media only screen and (max-width: 800px) {
  .lobby-card {
    width: 98%;
  }
}

@media only screen and (max-width: 1000px) {
  .scoreboard {
    width: 98%;
  }
}
</style>
