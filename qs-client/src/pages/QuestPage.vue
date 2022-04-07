<template>
  <q-page class="bg-secondary" v-if="ready">
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <scoreboard></scoreboard>
      </div>
    </div>

    <div class="row justify-center q-pb-md">
      <div class="col-4">
        <questCard v-bind:currentQuest="getCurrentQuest"> </questCard>
      </div>
    </div>
    <div class="row justify-center">
      <div
        v-if="getGuildsPlayingQuest(getCurrentQuest).length"
        class="col-6"
      >
        <guilds-table
          v-bind:guilds="getGuildsPlayingQuest(getCurrentQuest)"
          v-bind:scores="getGuildScoreMap"
          v-bind:showPlayers="true"
        >
          <template v-slot:default="slotProps">
            <guilds-playing-indicator
              v-bind:quest="getCurrentQuest"
              v-bind:playing="isPlayingQuestAsGuildId()"
              v-bind:guild="slotProps.guild" />
          </template>
        </guilds-table>
      </div>
      <div v-else>
        <h5>There are no guilds playing quest</h5>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import questCard from "../components/quest-card.vue";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import nodeTree from "../components/node-tree.vue";
import nodeForm from "../components/node-form.vue";
import GuildsTable from "../components/guilds-table.vue";
import GuildsPlayingIndicator from "../components/guilds-playing-indicator.vue";
import { mapActions, mapState, mapGetters } from "vuex";
import { GuildsActionTypes, GuildsGetterTypes } from "../store/guilds";
import { QuestsGetterTypes, QuestsActionTypes } from "../store/quests";
import {
  ConversationGetterTypes,
  ConversationActionTypes,
} from "../store/conversation";
import { Casting } from "../types";
import { MembersActionTypes } from "../store/members";

@Component<QuestViewPage>({
  components: {
    questCard,
    scoreboard,
    member,
    nodeForm,
    nodeTree,
    GuildsTable,
    GuildsPlayingIndicator,
  },
  computed: {
    ...mapGetters("quests", [
      "getCurrentQuest",
      "getCurrentGamePlay",
      "castingInQuest",
      "isPlayingQuestAsGuildId",
    ]),
    ...mapGetters("conversation", [
      "getConversationNodeById",
      "getConversation",
      "getConversationTree",
      "getFocusNode",
      "getRootNode",
      "getThreatMap",
      "getScoreMap",
      "getGuildScoreMap",
    ]),
    ...mapGetters("guilds", ["getGuildsPlayingQuest"]),
  },
  methods: {
    ...mapActions("quests", ["setCurrentQuest", "ensureCurrentQuest", "ensureAllQuests"]),
    ...mapActions("guilds", ["ensureGuildsPlayingQuest"]),
    ...mapActions("members", ["fetchMemberById", 'ensureAllMembers']),
    ...mapActions("conversation", [
      "ensureConversation",
      "ensureConversationSubtree",
      "ensureRootNode",
      "ensureConversationNeighbourhood",
    ]),
  },
})
export default class QuestViewPage extends Vue {
  ready = false;
  questId: number;
  selectedNodeId: number = null;

  // declare the computed attributes for Typescript
  getCurrentQuest: QuestsGetterTypes["getCurrentQuest"];
  getConversationNodeById: ConversationGetterTypes["getConversationNodeById"];
  getConversationTree: ConversationGetterTypes["getConversationTree"];
  getConversation: ConversationGetterTypes["getConversation"];
  getFocusNode: ConversationGetterTypes["getFocusNode"];
  getCurrentGamePlay!: QuestsGetterTypes["getCurrentGamePlay"];
  getRootNode!: ConversationGetterTypes["getRootNode"];
  isPlayingQuestInGuild!: QuestsGetterTypes["isPlayingQuestInGuild"];
  castingInQuest!: QuestsGetterTypes["castingInQuest"];
  isPlayingQuestAsGuildId!: QuestsGetterTypes["isPlayingQuestAsGuildId"];
  getGuildsPlayingQuest!: GuildsGetterTypes["getGuildsPlayingQuest"];
  getThreatMap!: ConversationGetterTypes["getThreatMap"];
  getScoreMap!: ConversationGetterTypes["getScoreMap"];
  getGuildScoreMap!: ConversationGetterTypes["getGuildScoreMap"];

  // declare the methods for Typescript
  setCurrentQuest: QuestsActionTypes["setCurrentQuest"];
  ensureCurrentQuest: QuestsActionTypes["ensureCurrentQuest"];
  ensureConversation: ConversationActionTypes["ensureConversation"];
  ensureRootNode: ConversationActionTypes["ensureRootNode"];
  ensureConversationSubtree: ConversationActionTypes["ensureConversationSubtree"];
  ensureGuildsPlayingQuest: GuildsActionTypes["ensureGuildsPlayingQuest"];
  ensureConversationNeighbourhood: ConversationActionTypes["ensureConversationNeighbourhood"];
  ensureAllQuests: QuestsActionTypes['ensureAllQuests']
  ensureAllMembers: MembersActionTypes['ensureAllMembers']

  selectionChanged(id) {
    this.selectedNodeId = id;
  }
  async getPlayerPlayingInQuest() {
    const playing = this.castingInQuest(this.questId);
  }
  async beforeMount() {
    document.title="Quest"
    const quest_id = Number.parseInt(this.$route.params.quest_id);
    this.questId = quest_id;
    await Promise.all([
      this.ensureAllMembers(),
      this.ensureCurrentQuest({quest_id}),
      this.ensureConversation(quest_id),
      this.ensureGuildsPlayingQuest({ quest_id }),
    ]);
    let node_id =
      await this.getCurrentGamePlay?.focus_node_id || this.getRootNode?.id;
    if (node_id) {
      await this.ensureConversationNeighbourhood({
        node_id,
        guild_id: null,
      });
      this.selectedNodeId = this.getFocusNode.id;
    }
    await this.getPlayerPlayingInQuest();
    this.ready = true;
  }
}
</script>
<style></style>
