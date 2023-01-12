<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card style="width: 60%">
        <div>
          <member></member>
        </div>
        <div class="column items-center">
          <div class="col-4 q-pa-lg" style="width: 100%">
            <scoreboard></scoreboard>
          </div>
        </div>

        <div class="row justify-center q-pb-md">
          <div class="col-6">
            <questCard v-bind:currentQuest="getCurrentQuest"> </questCard>
          </div>
        </div>
        <div class="row justify-center">
          <div v-if="getGuildsPlayingCurrentQuest.length">
            <guilds-table
              v-bind:guilds="getGuildsPlayingCurrentQuest"
              v-bind:scores="getGuildScoreMap"
              v-bind:showPlayers="true"
              v-bind:selectable="true"
              v-bind:quest="getCurrentQuest"
              style="width: 100%"
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
          <guild-members
            v-bind:guild="getCurrentGuild"
            v-bind:quest="getCurrentQuest"
            v-bind:members="getPlayersOfCurrentQuestGuild"
            v-bind:playersOnly="true"
            style="width: 70%"
            class="q-mt-md q-mb-md"
          />
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
    ...mapGetters("guilds", ["getGuildsPlayingCurrentQuest", "getCurrentGuild"]),
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
<style></style>
