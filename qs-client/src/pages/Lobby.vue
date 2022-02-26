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
      <div
        v-if="getQuests && getQuests.length"
        class="col-4 q-pa-lg"
        style="width: 55%"
      >
        <questTable
          v-bind:quests="getQuests"
          :view="true"
          title="Quests"
        ></questTable>
      </div>
      <div v-else class="column items-center q-mt-md">
        <h4>There are no quests</h4>
      </div>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <p>
          If you have not already choosen a guild to join. Select one from the
          list If you are already a member of a guild, click on enter button to
          go to that guild's page
        </p>
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
    <div class="column items-center">
      <div
        v-if="getGuilds && getGuilds.length"
        class="col-4 q-pa-lg"
        style="width: 55%"
      ></div>
      <div v-else class="column items-center q-mt-md">
        <h4>There are no guilds</h4>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import scoreboard from "../components/scoreboard.vue";
import questTable from "../components/quest-table.vue";
import GuildsTable from "../components/guilds-table.vue";
import member from "../components/member.vue";
import { Guild } from "../types";
import { mapActions, mapState, mapGetters } from "vuex";
import { QuestsActionTypes, QuestsGetterTypes } from "src/store/quests";
import { GuildsActionTypes, GuildsGetterTypes } from "src/store/guilds";
import { MemberGetterTypes } from "src/store/member";
import { userLoaded } from "../boot/userLoaded";
import Component from "vue-class-component";
import Vue from "vue";
import GuildsMembershipIndicator from "../components/guilds-membership-indicator.vue";

@Component<LobbyPage>({
  name: "LobbyPage",
  components: {
    scoreboard: scoreboard,
    questTable: questTable,
    member: member,
    GuildsTable: GuildsTable,
    GuildsMembershipIndicator: GuildsMembershipIndicator,
  },
  computed: {
    ...mapGetters("guilds", ["getGuilds", "getMyGuilds"]),
    ...mapGetters("quests", ["getQuests"]),
    ...mapState("member", ["member", "getUserId"]),

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
    ...mapActions("quests", ["ensureAllQuests"]),
    ...mapActions("guilds", ["ensureAllGuilds"]),
    guildBelongsTo() {},
  },
})
export default class LobbyPage extends Vue {
  columns1 = [
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
      name: "questNodeId",
      required: false,
      label: "Action",
      align: "left",
      field: "id",
      sortable: true,
    },
  ];

  getOpenGuilds!: Guild[];
  getClosedGuilds!: Guild[];

  getMyGuilds!: GuildsGetterTypes["getMyGuilds"];
  getQuests!: QuestsGetterTypes["getQuests"];
  getGuilds!: GuildsGetterTypes["getGuilds"];
  getUserId!: MemberGetterTypes["getUserId"];

  // declare the methods for Typescript
  ensureAllQuests: QuestsActionTypes["ensureAllQuests"];
  ensureAllGuilds: GuildsActionTypes["ensureAllGuilds"];

  guildBelongsTo(id) {
    const guildId = this.getMyGuilds.find((el) => el.id == id);
    if (guildId) {
      return "Yes";
    } else {
      return "No";
    }
  }

  async beforeMount() {
    document.title = "Dashboard";
    await userLoaded;
    await Promise.all([this.ensureAllQuests(), this.ensureAllGuilds()]);
  }
}
</script>
<style>
p {
  background-color: lightgrey;
  color: blue;
  font-size: 15pt;
}
</style>
