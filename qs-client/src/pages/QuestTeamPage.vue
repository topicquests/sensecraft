<template>
  <q-page class="bg-secondary" v-if="ready">
     <div class="row justify-center">
       <q-card style="width:60%">
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
      <div
        v-if="getGuildsPlayingQuest(getCurrentQuest).length"
      >
        <guilds-table
          v-bind:guilds="getGuildsPlayingQuest(getCurrentQuest)"
          v-bind:scores="getGuildScoreMap"
          v-bind:showPlayers="true"
          v-bind:selectable="true"
          style="width: 100%;"
        >
          <template v-slot:default="slotProps">
            <guilds-playing-indicator
              v-bind:quest="getCurrentQuest"
              v-bind:playing="isPlayingQuestAsGuildId() == slotProps.guild.id"
              v-bind:guild="slotProps.guild" />
          </template>
        </guilds-table>
      </div>
      <div v-else>
        <h3>There are no guilds playing quest</h3>
      </div>
    </div>
    <div class="row justify-center"  v-if="getCurrentGuild">
      <guild-members
        v-bind:guild="getCurrentGuild"
        v-bind:quest="getCurrentQuest"
        v-bind:members="getPlayersOfQuestGuild(getCurrentQuest, getCurrentGuild)"
        v-bind:playersOnly="true"
        style="width:70%"
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
import { mapActions, mapState, mapGetters } from "vuex";
import { GuildsActionTypes, GuildsGetterTypes } from "../store/guilds";
import { MembersGetterTypes } from "../store/members";
import { QuestsGetterTypes, QuestsActionTypes } from "../store/quests";
import {
  ConversationGetterTypes,
  ConversationActionTypes,
} from "../store/conversation";
import { RoleActionTypes } from "../store/role";
import { Casting } from "../types";
import { MembersActionTypes } from "../store/members";
import GuildMembers from "../components/guild-members.vue";

@Component<QuestTeamPage>({
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
    ]),
    ...mapGetters("conversation", [
      "getScoreMap",
      "getGuildScoreMap",
    ]),
    ...mapGetters("guilds", ["getGuildsPlayingQuest", "getCurrentGuild"]),
    ...mapGetters("members", ["getPlayersOfQuestGuild"]),
  },
  methods: {
    ...mapActions("quests", ["setCurrentQuest", "ensureCurrentQuest", "ensureAllQuests"]),
    ...mapActions("guilds", ["ensureGuildsPlayingQuest"]),
    ...mapActions("members", ["fetchMemberById", 'ensurePlayersOfQuest']),
    ...mapActions("role", ["ensureAllRoles"]),
    ...mapActions("conversation", [
      "ensureConversation",
    ]),
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
  getGuildsPlayingQuest!: GuildsGetterTypes["getGuildsPlayingQuest"];
  getScoreMap!: ConversationGetterTypes["getScoreMap"];
  getGuildScoreMap!: ConversationGetterTypes["getGuildScoreMap"];
  getPlayersOfQuestGuild!: MembersGetterTypes["getPlayersOfQuestGuild"];
  ensureAllRoles!: RoleActionTypes["ensureAllRoles"];

  // declare the methods for Typescript
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  ensureCurrentQuest: QuestsActionTypes["ensureCurrentQuest"];
  ensureConversation: ConversationActionTypes["ensureConversation"];
  ensureGuildsPlayingQuest: GuildsActionTypes["ensureGuildsPlayingQuest"];
  ensureAllQuests: QuestsActionTypes['ensureAllQuests']
  ensurePlayersOfQuest: MembersActionTypes['ensurePlayersOfQuest']

  async beforeMount() {
    document.title="Quest"
    const quest_id = Number.parseInt(this.$route.params.quest_id);
    this.questId = quest_id;
    await Promise.all([
      this.ensurePlayersOfQuest({ questId: quest_id }),
      this.ensureAllRoles(),
      this.ensureCurrentQuest({quest_id}),
      this.ensureConversation(quest_id),
    ]);
    await this.ensureGuildsPlayingQuest({ quest_id });
    this.ready = true;
  }
}
</script>
<style></style>
