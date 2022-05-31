<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card style="width: 80%" class="q-mt-md">
        <div>
          <member></member>
        </div>
        <div class="column items-center">
          <div class="col-4" style="width: 100%">
            <scoreboard></scoreboard>
          </div>
        </div>
        <div class="column items-center">
          <div
            v-if="getQuests && getQuests.length"
            class="col-6"
            style="width: 100%"
          >
            <questTable v-bind:quests="getQuests" :view="true" title="Quests">
              <template v-slot:default="slotProps">
                <quest-date-time-interval v-bind:quest="slotProps.quest"/>
              </template>
            </questTable>
          </div>
          <div v-else class="column items-center q-mt-md">
            <h4>There are no quests</h4>
          </div>
        </div>
        <div class="column items-center">
          <div class="col-4" style="width: 100%">
            <p>
              If you have not already choosen a guild to join. Select one from
              the list If you are already a member of a guild, click on enter
              button to go to that guild's page
            </p>
          </div>
        </div>
        <div class="column items-center">
          <div class="col-4" style="width: 100%">
            <div v-if="getGuilds.length">
              <div v-if="getUserId">
                <guilds-table
                  v-if="getMyGuilds.length"
                  v-bind:guilds="getMyGuilds"
                  v-bind:title="'My Guilds'"
                  :view="true"
                >
                  <template v-slot:default="slotProps">
                    <guilds-membership-indicator
                      v-bind:guild="slotProps.guild"
                    />
                  </template>
                </guilds-table>
                <guilds-table
                  v-if="getOpenGuilds.length"
                  v-bind:guilds="getOpenGuilds"
                  v-bind:title="'Open Guilds'"
                  :view="true"
                >
                  <template v-slot:default="slotProps">
                    <guilds-membership-indicator
                      v-bind:guild="slotProps.guild"
                    />
                  </template>
                </guilds-table>
                <guilds-table
                  v-if="getClosedGuilds.length"
                  v-bind:guilds="getClosedGuilds"
                  v-bind:title="'Closed Guilds'"
                  :view="true"
                >
                  <template v-slot:default="slotProps">
                    <guilds-membership-indicator
                      v-bind:guild="slotProps.guild"
                    />
                  </template>
                </guilds-table>
              </div>
              <div v-else>
                <guilds-table
                  v-bind:guilds="getGuilds"
                  v-bind:title="'Guilds'"
                  :view="true"
                ></guilds-table>
              </div>
            </div>
            <h4 v-else style="text-align: center">
              There currently are no guilds
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
import QuestDateTimeInterval from "../components/quest-date-time-interval.vue";

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
    QuestDateTimeInterval: QuestDateTimeInterval,
  },
  computed: {
    ...mapGetters("guilds", ["getGuilds", "getMyGuilds", "isGuildMember"]),
    ...mapGetters("quests", ["getQuests"]),
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
  setCurrentGuild: GuildsActionTypes["setCurrentGuild"];
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  ensureAllQuests: QuestsActionTypes["ensureAllQuests"];
  ensureAllGuilds: GuildsActionTypes["ensureAllGuilds"];

  async beforeMount() {
    await userLoaded;
    await this.setCurrentGuild(null);
    await this.setCurrentQuest(null);
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
</style>
