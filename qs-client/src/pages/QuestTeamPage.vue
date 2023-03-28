<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card class="quest-team">
        <div>
          <member></member>
        </div>
        <div class="row justify-center">
          <div class="column scoreboard">
            <div class="col-12 q-mb-md">
              <scoreboard></scoreboard>
            </div>
          </div>
        </div>
        <div class="row justify-center">
          <div class="column quest-card-col">
            <div class="col-12 q-mb-md">
              <questCard v-bind:currentQuest="getCurrentQuest"> </questCard>
            </div>
          </div>
        </div>

        <div class="column items-center">
          <div
            class="q-ma-sm guilds-table-col"
            v-if="getGuildsPlayingCurrentQuest.length"
          >
            <guilds-table
              v-bind:guilds="getGuildsPlayingCurrentQuest"
              v-bind:scores="getGuildScoreMap"
              v-bind:showPlayers="true"
              v-bind:selectable="true"
              v-bind:quest="getCurrentQuest"
            >
              <template v-slot:default="slotProps">
                <router-link
                  :to="{
                    name: 'guild',
                    params: { guild_id: slotProps.guild.id },
                  }"
                >
                  View
                </router-link>
                <span v-if="getCurrentQuest.is_playing">
                  <!-- already playing -->
                </span>
                <span v-else-if="getCurrentQuest.status != 'registration'">
                  <!-- not in registration phase -->
                </span>
                <span v-else-if="slotProps.guild.is_member">
                  &nbsp;Join Game
                  <!-- TODO: join game -->
                </span>
                <span
                  v-else-if="
                    getCurrentQuest.my_confirmed_guild_count +
                      getCurrentQuest.my_recruiting_guild_count >
                    0
                  "
                >
                  <!-- one of my guilds is recruiting or confirmed, nothing to do here -->
                </span>
                <span v-else-if="slotProps.guild.open_for_applications">
                  &nbsp;Join Guild<!-- TODO: Join guild -->
                </span>
                <span v-else></span>
              </template>
            </guilds-table>
          </div>
          <div v-else>
            <h3>There are no guilds playing quest</h3>
          </div>
        </div>

        <div class="row justify-center" v-if="getCurrentGuild">
          <div class="column guild-member-col">
            <guild-members
              v-bind:guild="getCurrentGuild"
              v-bind:quest="getCurrentQuest"
              v-bind:members="getPlayersOfCurrentQuestGuild"
              v-bind:playersOnly="true"
              class="q-mt-md q-mb-md"
            />
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import questCard from "../components/quest-card.vue";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import GuildsTable from "../components/guilds-table.vue";
import GuildsPlayingIndicator from "../components/guilds-playing-indicator.vue";
import { mapActions, mapGetters } from "vuex";
import { GuildsActionTypes, GuildsGetterTypes } from "../store/guilds";
import { QuestsGetterTypes, QuestsActionTypes } from "../store/quests";
import {
  ConversationGetterTypes,
  ConversationActionTypes,
} from "../store/conversation";
import { RoleActionTypes } from "../store/role";
import { MembersActionTypes } from "../store/members";
import GuildMembers from "../components/guild-members.vue";

@Component<QuestTeamPage>({
  meta: (c) => ({
    title: `Quest teams - ${c.getCurrentQuest?.name}`,
  }),
  components: {
    questCard,
    scoreboard,
    member,
    GuildsTable,
    GuildsPlayingIndicator,
    GuildMembers,
  },
  computed: {
    ...mapGetters("quests", [
      "getCurrentQuest",
      "getCurrentGamePlay",
      "castingInQuest",
      "isPlayingQuestAsGuildId",
      "getPlayersOfCurrentQuest",
      "getPlayersOfCurrentQuestGuild",
    ]),
    ...mapGetters("conversation", ["getScoreMap", "getGuildScoreMap"]),
    ...mapGetters("guilds", [
      "getGuildsPlayingCurrentQuest",
      "getCurrentGuild",
    ]),
  },
  methods: {
    ...mapActions("quests", [
      "setCurrentQuest",
      "ensureCurrentQuest",
      "ensureAllQuests",
    ]),
    ...mapActions("guilds", ["ensureGuildsPlayingQuest"]),
    ...mapActions("members", ["fetchMemberById", "ensurePlayersOfQuest"]),
    ...mapActions("role", ["ensureAllRoles"]),
    ...mapActions("conversation", ["ensureConversation"]),
  },
  watch: {
    $route(to, from) {
      this.ready = false;
      this.initialize();
    },
  },
})
export default class QuestTeamPage extends Vue {
  ready = false;
  questId: number;

  // declare the computed attributes for Typescript
  getCurrentGuild: GuildsGetterTypes["getCurrentGuild"];
  getCurrentQuest: QuestsGetterTypes["getCurrentQuest"];
  getCurrentGamePlay!: QuestsGetterTypes["getCurrentGamePlay"];
  getRootNode!: ConversationGetterTypes["getRootNode"];
  isPlayingQuestInGuild!: QuestsGetterTypes["isPlayingQuestInGuild"];
  castingInQuest!: QuestsGetterTypes["castingInQuest"];
  isPlayingQuestAsGuildId!: QuestsGetterTypes["isPlayingQuestAsGuildId"];
  getPlayersOfCurrentQuest!: QuestsGetterTypes["getPlayersOfCurrentQuest"];
  getPlayersOfCurrentQuestGuild!: QuestsGetterTypes["getPlayersOfCurrentQuestGuild"];
  getGuildsPlayingCurrentQuest!: GuildsGetterTypes["getGuildsPlayingCurrentQuest"];
  getScoreMap!: ConversationGetterTypes["getScoreMap"];
  getGuildScoreMap!: ConversationGetterTypes["getGuildScoreMap"];
  ensureAllRoles!: RoleActionTypes["ensureAllRoles"];

  // declare the methods for Typescript
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  ensureCurrentQuest: QuestsActionTypes["ensureCurrentQuest"];
  ensureConversation: ConversationActionTypes["ensureConversation"];
  ensureGuildsPlayingQuest: GuildsActionTypes["ensureGuildsPlayingQuest"];
  ensureAllQuests: QuestsActionTypes["ensureAllQuests"];
  ensurePlayersOfQuest: MembersActionTypes["ensurePlayersOfQuest"];

  async initialize() {
    const quest_id = Number.parseInt(this.$route.params.quest_id);
    this.questId = quest_id;
    await Promise.all([
      this.ensurePlayersOfQuest({ questId: quest_id }),
      this.ensureAllRoles(),
      this.ensureCurrentQuest({ quest_id }),
      this.ensureConversation(quest_id),
    ]);
    await this.ensureGuildsPlayingQuest({ quest_id });
    this.ready = true;
  }
  async beforeMount() {
    await this.initialize();
  }
}
</script>
<style>
.guild-member-col {
  width: 70%;
}
.guilds-table-col {
  width: 70%;
}

.quest-team {
  width: 70%;
}
.quest-card-col {
  width: 70%;
}

.scoreboard {
  width: 70%;
}

@media only screen and (max-width: 1300px) {
  .quest-team {
    width: 70%;
  }
}
@media only screen and (max-width: 800px) {
  .quest-team {
    width: 95%;
  }
}
@media only screen and (max-width: 1000px) {
  .scoreboard {
    width: 95%;
  }
}
@media only screen and (max-width: 1000px) {
  .quest-card-col {
    width: 95%;
  }
}
@media only screen and (max-width: 800px) {
  .guild-member-col {
    width: 95%;
  }
}
@media only screen and (max-width: 800px) {
  .guilds-table-col {
    width: 96%;
  }
}
</style>
